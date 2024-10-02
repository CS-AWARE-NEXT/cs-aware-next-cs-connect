package controller

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
	"github.com/gofiber/fiber/v2"
)

type LinkController struct {
	linkRepository *repository.LinkRepository
}

func NewLinkController(linkRepository *repository.LinkRepository) *LinkController {
	return &LinkController{
		linkRepository: linkRepository,
	}
}

func (lc *LinkController) GetLinks(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	parentId := c.Params("parentId")
	log.Printf("Getting links for org %s and parent %s", organizationId, parentId)

	links, err := lc.linkRepository.GetLinksByOrganizationIDAndParentID(organizationId, parentId)
	if err != nil {
		log.Printf("Could not get links: %s", err.Error())
		return c.JSON(fiber.Map{
			"items": []model.Link{},
		})
	}
	log.Printf("Got links")
	return c.JSON(fiber.Map{
		"items": links,
	})
}

func (lc *LinkController) SaveLink(c *fiber.Ctx) error {
	log.Printf("Saving link")
	var link model.Link
	err := json.Unmarshal(c.Body(), &link)
	if err != nil {
		return c.JSON(fiber.Map{
			"error": "Not a valid link provided",
		})
	}

	linkID := util.GenerateUUID()
	savedLink, err := lc.linkRepository.SaveLink(model.Link{
		ID:             linkID,
		Name:           link.Name,
		Description:    link.Description,
		Link:           link.Link,
		OrganizationId: link.OrganizationId,
		ParentId:       link.ParentId,
	})
	if err != nil {
		log.Printf("Could not save link: %s", err.Error())
		return c.JSON(fiber.Map{
			"error": fmt.Sprintf("Could not save link %s due to %s", link.Name, err.Error()),
		})
	}
	log.Printf("Saved link")
	return c.JSON(savedLink)
}

func (lc *LinkController) DeleteLink(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	parentId := c.Params("parentId")
	linkId := c.Params("linkId")

	log.Printf("Deleting link %s for org %s and parent %s", linkId, organizationId, parentId)

	err := lc.linkRepository.DeleteLinkByID(linkId)
	if err != nil {
		log.Printf("Could not delete link: %s", err.Error())
		return c.JSON(fiber.Map{
			"error": fmt.Sprintf("Could not delete link %s due to %s", linkId, err.Error()),
		})
	}
	log.Printf("Deleted link")
	return c.JSON(fiber.Map{
		"deleted": linkId,
	})
}
