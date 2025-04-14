package controller

import (
	"encoding/json"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/data"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/service"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/pkg/errors"
)

type EcosystemGraphController struct {
	ecosystemGraphRepository *repository.EcosystemGraphRepository
	cacheRepository          *repository.CacheRepository
	authService              *service.AuthService
	endpoint                 string
}

func NewEcosystemGraphController(
	ecosystemGraphRepository *repository.EcosystemGraphRepository,
	cacheRepository *repository.CacheRepository,
	authService *service.AuthService,
	endpoint string,
) *EcosystemGraphController {
	return &EcosystemGraphController{
		ecosystemGraphRepository: ecosystemGraphRepository,
		cacheRepository:          cacheRepository,
		authService:              authService,
		endpoint:                 endpoint,
	}
}

func (egc *EcosystemGraphController) GetEcosystemGraph(c *fiber.Ctx) error {
	if ecosystemGraph, err := egc.ecosystemGraphRepository.GetEcosystemGraph(); err == nil {
		log.Info("Ecosystem graph found in the database, returning it")
		return c.JSON(ecosystemGraph)
	} else if err == util.ErrNotFound {
		log.Info("No ecosystem graph found in the database, falling back to default")

		// Attempt retrieving a default graph from a json file
		if ecosystemGraph, err := egc.getEcosystemGraphFromFile("ecosystem-graph.json"); err == nil {
			return c.JSON(ecosystemGraph)
		}
	}
	log.Info("The error was not 'ErrNotFound', returning an empty graph")
	return c.JSON(model.EcosystemGraphData{})
}

func (egc *EcosystemGraphController) getEcosystemGraphFromFile(fileName string) (model.EcosystemGraphData, error) {
	filePath, err := util.GetEmbeddedFilePath(fileName, "*.json")
	if err != nil {
		return model.EcosystemGraphData{}, err
	}
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		return model.EcosystemGraphData{}, err
	}
	var ecosystemGraphData model.EcosystemGraphData
	err = json.Unmarshal(content, &ecosystemGraphData)
	if err != nil {
		return model.EcosystemGraphData{}, err
	}
	return ecosystemGraphData, nil
}

func (egc *EcosystemGraphController) RefreshLockEcosystemGraph(c *fiber.Ctx) error {
	var ecosystemGraphData model.RefreshLockEcosystemGraphParams
	err := json.Unmarshal(c.Body(), &ecosystemGraphData)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Not a valid ecosystem graph provided",
		})
	}

	lockAcquired, err := egc.cacheRepository.GetLock("ecosystem-graph", ecosystemGraphData.UserID, ecosystemGraphData.LockDelay)
	if err != nil {
		return errors.Wrap(err, "couldn't acquire lock")
	}
	if !lockAcquired {
		return fiber.NewError(fiber.StatusConflict, "couldn't acquire lock")
	}

	// If no nodes (nor edges, but this check is enough) were passed, the call was used just to refresh the lock
	if len(ecosystemGraphData.Nodes) > 0 {
		if err := egc.ecosystemGraphRepository.SaveEcosystemGraph(ecosystemGraphData.Nodes, ecosystemGraphData.Edges); err != nil {
			return errors.Wrap(err, "couldn't save ecosystem graph")
		}
	}
	return c.JSON(fiber.Map{})
}

func (egc *EcosystemGraphController) DropLockEcosystemGraph(c *fiber.Ctx) error {
	var dropLockParams model.DropLockEcosystemGraphParams
	err := json.Unmarshal(c.Body(), &dropLockParams)
	if err != nil {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{
			"error": "Invalid request data",
		})
	}

	err = egc.cacheRepository.DropLock("ecosystem-graph", dropLockParams.UserID)
	if err != nil {
		return errors.Wrap(err, "couldn't delete lock")
	}
	return c.JSON(fiber.Map{})
}

func (egc *EcosystemGraphController) ExportEcosystemGraph(
	c *fiber.Ctx,
	vars map[string]string,
) error {
	ecosystemGraphExporter := service.NewJSONEcosystemGraphExporter(
		vars["ecosystemId"],
		egc.endpoint,
		egc.authService,
	)
	ecosystemGraph, err := egc.ecosystemGraphRepository.GetEcosystemGraph()
	if err != nil {
		log.Infof("Could not load ecosystem graph: %s", err.Error())
		return c.JSON(model.BaseResponse{
			Success: false,
			Message: "Could not export ecosystem graph, try again later",
		})
	}
	ecosystemGraphExport, err := ecosystemGraphExporter.ExportEcosystemGraph(ecosystemGraph, vars)
	if err != nil {
		log.Infof("Could not export ecosystem graph: %s", err.Error())
		return c.JSON(model.BaseResponse{
			Success: false,
			Message: "Could not export ecosystem graph because the external server returned an error",
		})
	}
	log.Infof("Ecosystem graph exported successfully: %s", ecosystemGraphExport.EcosystemID)
	return c.JSON(model.BaseResponse{
		Success: true,
		Message: "Ecosystem graph exported successfully",
	})
}
