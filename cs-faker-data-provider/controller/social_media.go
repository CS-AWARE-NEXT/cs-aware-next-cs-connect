package controller

import (
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/gofiber/fiber/v2"
)

func GetAllSocialMedia(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")

	tableData := model.PaginatedTableData{
		Columns: socialMediaPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, socialMedia := range socialMediaMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow{
			ID:          socialMedia.ID,
			Name:        socialMedia.Name,
			Description: socialMedia.Description,
		})
	}
	return c.JSON(tableData)
}

func GetSocialMedia(c *fiber.Ctx) error {
	return c.JSON(getSocialMediaByID(c))
}

func getSocialMediaByID(c *fiber.Ctx) model.SocialMedia {
	organizationId := c.Params("organizationId")
	socialMediaId := c.Params("socialMediaId")
	for _, socialMedia := range socialMediaMap[organizationId] {
		if socialMedia.ID == socialMediaId {
			return socialMedia
		}
	}
	return model.SocialMedia{}
}

var socialMediaMap = map[string][]model.SocialMedia{
	"5": {
		{
			ID:          "cb55b098-4c1d-4bfe-86ec-923a5e8933af",
			Name:        "X",
			Description: "X is available at https://x.com/home",
		},
	},
}

var socialMediaPaginatedTableData = model.PaginatedTableData{
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
