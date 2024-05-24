package controller

import (
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/gofiber/fiber/v2"
)

type ExpertConsultancyController struct{}

func NewExpertConsultancyController() *ExpertConsultancyController {
	return &ExpertConsultancyController{}
}

func (ec *ExpertConsultancyController) GetExpertConsultancies(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")

	tableData := model.PaginatedTableData{
		Columns: expertConsultancyPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, expertConsultancy := range expertConsultancyMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(expertConsultancy))
	}
	return c.JSON(tableData)
}

func (ec *ExpertConsultancyController) GetExpertConsultancy(c *fiber.Ctx) error {
	return c.JSON(ec.getExpertConsultancyByID(c))
}

func (ec *ExpertConsultancyController) GetInfo(c *fiber.Ctx) error {
	expertConsultancyId := c.Params("expertConsultancyId")
	return c.JSON(fiber.Map{"text": expertConsultancyInfoMap[expertConsultancyId]})
}

func (ec *ExpertConsultancyController) getExpertConsultancyByID(c *fiber.Ctx) model.ExpertConsultancy {
	organizationId := c.Params("organizationId")
	expertConsultancyId := c.Params("expertConsultancyId")
	for _, expertConsultancy := range expertConsultancyMap[organizationId] {
		if expertConsultancy.ID == expertConsultancyId {
			return expertConsultancy
		}
	}
	return model.ExpertConsultancy{}
}

var expertConsultancyMap = map[string][]model.ExpertConsultancy{
	"5": {
		{
			ID:          "7213e6db-235f-443d-9792-4ab62a68cb52",
			Name:        "General Consultancy",
			Description: "A channel for general questions",
		},
	},
}

var expertConsultancyInfoMap = map[string]string{
	"7213e6db-235f-443d-9792-4ab62a68cb52": "In this channel, you can ask our experts questions about anything.",
}

var expertConsultancyPaginatedTableData = model.PaginatedTableData{
	Columns: []model.PaginatedTableColumn{
		{
			Title: "Name",
		},
		{
			Title: "Description",
		},
	},
	Rows: []model.PaginatedTableRow{},
}
