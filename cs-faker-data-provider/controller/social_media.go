package controller

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"

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
	organizationId := c.Params("organizationId")
	organizationName := ""
	if organizationId == "6" {
		organizationName = "larissa"
	}
	if organizationId == "7" {
		organizationName = "deyal"
	}
	if organizationId == "8" {
		organizationName = "5thype"
	}

	fileName := "posts.json"
	if organizationName != "" {
		fileName = fmt.Sprintf("%s-%s", organizationName, fileName)
	}
	socialMedia := getSocialMediaByID(c)
	if strings.Contains(socialMedia.Name, "Sample Twitter") {
		fileName = "sample-posts.json"
	}

	if socialMediaEntities, err := getSocialMediaEntitiesFromFile(fileName); err == nil {
		return c.JSON(fromSocialMediaPostEntityData(socialMediaEntities, organizationName))
	}
	return c.JSON(model.SocialMediaPostData{Items: []model.SocialMediaPost{}})
}

func GetSocialMediaPostsPerHashtagChart(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	organizationName := ""
	if organizationId == "6" {
		organizationName = "larissa"
	}
	if organizationId == "7" {
		organizationName = "deyal"
	}
	if organizationId == "8" {
		organizationName = "5thype"
	}
	fileName := "posts.json"
	if organizationName != "" {
		fileName = fmt.Sprintf("%s-%s", organizationName, fileName)
	}
	socialMedia := getSocialMediaByID(c)
	if strings.Contains(socialMedia.Name, "Sample Twitter") {
		fileName = "sample-posts.json"
	}

	socialMediaEntities, err := getSocialMediaEntitiesFromFile(fileName)
	if err != nil {
		return c.JSON(model.SimpleLineChartData{LineData: []model.SimpleLineChartValue{}})
	}
	postsPerHashtag := make(map[string]int)
	for _, post := range socialMediaEntities.Posts {
		for _, hashtag := range post.Hashtags {
			_, ok := postsPerHashtag[strings.ToLower(hashtag)]
			if !ok {
				postsPerHashtag[strings.ToLower(hashtag)] = 0
				continue
			}
		}
	}
	for _, post := range socialMediaEntities.Posts {
		for _, hashtag := range post.Hashtags {
			postsPerHashtag[strings.ToLower(hashtag)] = postsPerHashtag[strings.ToLower(hashtag)] + 1
		}
	}
	keys := make([]string, 0, len(postsPerHashtag))
	for key := range postsPerHashtag {
		keys = append(keys, key)
	}
	sort.SliceStable(keys, func(i, j int) bool {
		return postsPerHashtag[keys[i]] < postsPerHashtag[keys[j]]
	})
	lines := []model.SimpleLineChartValue{}
	for _, k := range keys {
		label := k
		if k == "" {
			label = "Missing"
		}
		lines = append(lines, model.SimpleLineChartValue{
			Label:         label,
			NumberOfPosts: float64(postsPerHashtag[k]),
		})
	}
	chartData := model.SimpleLineChartData{
		LineData: lines,
		LineColor: model.LineColor{
			NumberOfPosts: "#1DA1F2",
		},
	}
	return c.JSON(chartData)
}

func GetSocialMediaPostsPerComponentChart(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	organizationName := ""
	if organizationId == "6" {
		organizationName = "larissa"
	}
	if organizationId == "7" {
		organizationName = "deyal"
	}
	if organizationId == "8" {
		organizationName = "5thype"
	}
	fileName := "posts.json"
	if organizationName != "" {
		fileName = fmt.Sprintf("%s-%s", organizationName, fileName)
	}
	socialMedia := getSocialMediaByID(c)
	if strings.Contains(socialMedia.Name, "Sample Twitter") {
		fileName = "sample-posts.json"
	}

	socialMediaEntities, err := getSocialMediaEntitiesFromFile(fileName)
	if err != nil {
		return c.JSON(model.SimpleLineChartData{LineData: []model.SimpleLineChartValue{}})
	}
	postsPerComponent := make(map[string]int)
	for _, post := range socialMediaEntities.Posts {
		n, ok := postsPerComponent[post.AssociatedComponent]
		if !ok {
			postsPerComponent[post.AssociatedComponent] = 1
			continue
		}
		postsPerComponent[post.AssociatedComponent] = n + 1
	}
	lines := []model.SimpleLineChartValue{}
	for k, v := range postsPerComponent {
		label := k
		if k == "" {
			label = "Missing"
		}
		lines = append(lines, model.SimpleLineChartValue{
			Label:         label,
			NumberOfPosts: float64(v),
		})
	}
	chartData := model.SimpleLineChartData{
		LineData: lines,
		LineColor: model.LineColor{
			NumberOfPosts: "#1DA1F2",
		},
	}
	return c.JSON(chartData)
}

func getSocialMediaEntitiesFromFile(fileName string) (model.SocialMediaPostEntityData, error) {
	filePath, err := util.GetEmbeddedFilePath(fileName, "*.json")
	if err != nil {
		return model.SocialMediaPostEntityData{}, err
	}
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		return model.SocialMediaPostEntityData{}, err
	}
	var socialMediaPostEntityData model.SocialMediaPostEntityData
	err = json.Unmarshal(content, &socialMediaPostEntityData)
	if err != nil {
		return model.SocialMediaPostEntityData{}, err
	}
	return socialMediaPostEntityData, nil
}

func fromSocialMediaPostEntityData(
	socialMediaPostEntityData model.SocialMediaPostEntityData,
	idNameSpace string,
) model.SocialMediaPostData {
	var posts []model.SocialMediaPost
	for _, post := range socialMediaPostEntityData.Posts {
		postId := post.ID
		if idNameSpace != "" {
			postId = fmt.Sprintf("%s-%s", post.ID, idNameSpace)
		}
		posts = append(posts, model.SocialMediaPost{
			ID:       postId,
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
	"6": {
		{
			ID:          "8086f15e-4a1d-48a7-a91d-b5ac971b23cd",
			Name:        "Twitter",
			Description: "Twitter is available at https://twitter.com/home",
		},
	},
	"7": {
		{
			ID:          "9f85f74b-1f8c-4546-aa10-e080a1b9cd2d",
			Name:        "Twitter",
			Description: "Twitter is available at https://twitter.com/home",
		},
	},
	"8": {
		{
			ID:          "cc41562b-273c-494b-ab60-70b2ee12e343",
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
