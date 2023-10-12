package controller

import (
	"fmt"

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

// Avatar: `https://xsgames.co/randomusers/avatar.php?g=pixel&key=${i}`,
func GetSocialMediaPosts(c *fiber.Ctx) error {
	var posts []model.SocialMediaPost
	for i := 0; i < 23; i++ {
		media := ""
		if i%2 == 0 {
			media = "https://random.imagecdn.app/550/350"
		}
		post := model.SocialMediaPost{
			ID:      fmt.Sprintf("%d", i),
			Title:   fmt.Sprintf("Username %d", i),
			Content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
			Media:   media,
		}
		posts = append(posts, post)
	}
	return c.JSON(model.SocialMediaPostData{Items: posts})
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
			Name:        "Twitter",
			Description: "Twitter is available at https://twitter.com/home",
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
