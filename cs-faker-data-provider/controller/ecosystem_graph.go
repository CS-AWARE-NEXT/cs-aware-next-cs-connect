package controller

import (
	"encoding/json"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/pkg/errors"
)

type EcosystemGraphController struct {
	ecosystemGraphRepository *repository.EcosystemGraphRepository
	cacheRepository          *repository.CacheRepository
}

func NewEcosystemGraphController(ecosystemGraphRepository *repository.EcosystemGraphRepository, cacheRepository *repository.CacheRepository) *EcosystemGraphController {
	return &EcosystemGraphController{
		ecosystemGraphRepository: ecosystemGraphRepository,
		cacheRepository:          cacheRepository,
	}
}

func (egc *EcosystemGraphController) GetEcosystemGraph(c *fiber.Ctx) error {
	if ecosystemGraph, err := egc.ecosystemGraphRepository.GetEcosystemGraph(); err == nil {
		return c.JSON(ecosystemGraph)
	}
	return c.JSON(model.EcosystemGraphData{})
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
