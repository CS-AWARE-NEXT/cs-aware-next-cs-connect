package controller

import (
	"encoding/json"
	"fmt"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/data"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
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
	socialMediaId := c.Params("socialMediaId")
	fileName := "posts.json"
	if socialMediaId == "165990a8-eb59-44bf-ab0c-613999960a48" {
		fileName = "sample-posts.json"
	}
	filePath, err := util.GetEmbeddedFilePath(fileName, "*.json")
	if err != nil {
		return c.JSON(model.SocialMediaPostData{Items: []model.SocialMediaPost{}})
	}
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		return c.JSON(model.SocialMediaPostData{Items: []model.SocialMediaPost{}})
	}
	var socialMediaPostEntityData model.SocialMediaPostEntityData
	err = json.Unmarshal(content, &socialMediaPostEntityData)
	if err != nil {
		return c.JSON(model.SocialMediaPostData{Items: []model.SocialMediaPost{}})
	}
	return c.JSON(fromSocialMediaPostEntityData(socialMediaPostEntityData))
}

func fromSocialMediaPostEntityData(socialMediaPostEntityData model.SocialMediaPostEntityData) model.SocialMediaPostData {
	var posts []model.SocialMediaPost
	for _, post := range socialMediaPostEntityData.Posts {
		posts = append(posts, model.SocialMediaPost{
			ID:       post.ID,
			Title:    post.User.Name,
			Content:  buildContent(post),
			Media:    post.Media,
			Avatar:   post.User.ProfilePicture,
			Date:     post.Date,
			Target:   post.AssociatedComponent,
			URL:      post.URL,
			Likes:    post.Likes,
			Replies:  post.Replies,
			Retweets: post.Retweets,
		})
	}
	return model.SocialMediaPostData{Items: posts}
}
func buildContent(post model.SocialMediaPostEntity) string {
	content := fmt.Sprintf("%s\n\n", post.Content)
	for _, hashtag := range post.Hashtags {
		content = fmt.Sprintf("%s#%s ", content, hashtag)
	}

	return content
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
		{
			ID:          "165990a8-eb59-44bf-ab0c-613999960a48",
			Name:        "Sample Twitter",
			Description: "Sample Twitter is available at https://twitter.com/home",
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
