package controller

import (
	"strconv"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/gofiber/fiber/v2"
)

func GetOrganizations(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"totalCount": 4,
		"pageCount":  1,
		"hasMore":    false,
		"items":      organizations,
	})
}

func GetOrganizationsNoPage(c *fiber.Ctx) error {
	return c.JSON(organizations)
}

func GetOrganization(c *fiber.Ctx) error {
	id := c.Params("organizationId")
	index, err := strconv.Atoi(id)
	if err != nil {
		return c.JSON(model.Organization{})
	}
	organization := organizations[index]
	return c.JSON(organization)

}

var organizations = []model.Organization{
	{
		ID:          "0",
		Name:        "Ecosystem",
		Description: "Ecosystem organization",
	},
	{
		ID:          "1",
		Name:        "X",
		Description: "X organization",
	},
	{
		ID:          "2",
		Name:        "Y",
		Description: "Y organization",
	},
	{
		ID:          "3",
		Name:        "Z",
		Description: "Z organization",
	},
}
