package controller

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

type NewsController struct{}

func NewNewsController() *NewsController {
	return &NewsController{}
}

func (nc *NewsController) GetAllNews(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: socialMediaPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, news := range newsMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(news))
	}
	return c.JSON(tableData)
}

func (nc *NewsController) GetNews(c *fiber.Ctx) error {
	return c.JSON(nc.getNewsByID(c))
}

func (nc *NewsController) getNewsByID(c *fiber.Ctx) model.News {
	organizationId := c.Params("organizationId")
	newsId := c.Params("newsId")
	for _, news := range newsMap[organizationId] {
		if news.ID == newsId {
			return news
		}
	}
	return model.News{}
}

func (nc *NewsController) GetNewsPosts(c *fiber.Ctx) error {
	newsEndpoint := os.Getenv("NEWS_ENDPOINT")
	log.Info("preparing for request at ", newsEndpoint)
	search := c.Query("search")
	if search == "" {
		log.Info("search parameter is empty, so empty result")
		return c.JSON(model.SocialMediaPostData{Items: []model.SocialMediaPost{}})
	}

	limit := c.Query("limit")
	if limit == "" {
		limit = "10"
	}
	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		log.Error("limit parameter is not a number ", err.Error())
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{"error": "limit parameter is not a number"})
	}

	offset := c.Query("offset")
	if offset == "" {
		offset = "0"
	}
	offsetInt, err := strconv.Atoi(offset)
	if err != nil {
		log.Error("offset parameter is not a number ", err.Error())
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{"error": "offset parameter is not a number"})
	}
	log.Info("finished preparation for request")

	log.Info("creating body ", search, " ", offset, " ", offsetInt, " ", limit, " ", limitInt)
	keywords := strings.Split(search, " ")
	body, err := json.Marshal(model.NewsPostBody{
		InstanceID:     "javi",
		Keywords:       keywords,
		TargetLanguage: "en",
		Offset:         offsetInt,
		Limit:          limitInt,
		NewerThan:      "2021-12-13T13:57:11.819492600Z",
	})
	if err != nil {
		log.Error("error creating body ", err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": err.Error()})
	}

	log.Info("creating request ", keywords, " ", offset)
	req, err := http.NewRequest(
		"POST",
		newsEndpoint,
		bytes.NewBuffer(body),
	)
	if err != nil {
		log.Error("error creating request ", err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": err.Error()})
	}
	req.Header.Set("Content-Type", "application/json")

	log.Info("requesting news posts")
	// TODO: try this to fix the error under HTTPS on AWS
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true, // Use only for testing, not in production
			},
		},
	}
	// client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Error("error requesting news posts ", err.Error())
		return c.JSON(fiber.Map{"error": err.Error()})
	}
	defer resp.Body.Close()

	log.Info("Response Status: ", resp.Status)
	log.Info("Response Headers: ", resp.Header)
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("error reading response body ", string(respBody), err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": err.Error()})
	}
	log.Info("Response body with no json convertion: ", string(respBody))

	log.Info("unmarshaling news posts")
	var newsPosts model.NewsPosts
	// we cannot use Unmarshal because we have to read from the Body reader first
	err = json.NewDecoder(bytes.NewReader(respBody)).Decode(&newsPosts)
	if err != nil {
		log.Error("error unmarshaling news posts ", err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(nc.fromNewsPosts(newsPosts))
}

func (nc *NewsController) fromNewsPosts(
	newsPosts model.NewsPosts,
) model.SocialMediaPostData {
	posts := []model.SocialMediaPost{}
	log.Info("parsing news posts ", len(newsPosts.Entries), " ", newsPosts.PageInfo.TotalCount)
	for _, post := range newsPosts.Entries {
		log.Info("parsing news post with title ", post.OriginalText.Title)
		postId := post.ID
		posts = append(posts, model.SocialMediaPost{
			ID:      postId,
			Title:   post.Source.Name,
			Content: nc.buildContent(post.OriginalText.Title, post.OriginalText.Body),
			URL:     postId,
		})
		log.Info("finished parsing news post with title ", post.OriginalText.Title)
	}
	log.Info("finished parsing news posts ", len(newsPosts.Entries), " ", newsPosts.PageInfo.TotalCount)
	return model.SocialMediaPostData{
		TotalCount: newsPosts.PageInfo.TotalCount,
		Items:      posts,
	}
}

func (nc *NewsController) buildContent(title string, text string) string {
	textContent := text
	// in case we need to cut strings because they are too long
	// if len(text) > 5000 {
	// 	textContent = fmt.Sprintf("%s...", strings.TrimSpace(text[:1000]))
	// }
	if title == "" {
		return textContent
	}
	return fmt.Sprintf("### %s\n\n%s", title, textContent)
}

var newsMap = map[string][]model.News{
	"5": {
		{
			ID:          "969b347f-89c0-4f5c-826c-510ae483b58e",
			Name:        "Online News",
			Description: "Look for what's new online",
		},
	},
	"6": {
		{
			ID:          "bb839490-8306-4ea1-8bff-bed135ac8016",
			Name:        "Online News",
			Description: "Look for what's new online",
		},
	},
	"7": {
		{
			ID:          "96f88d4f-5728-49c2-a97a-e8722860a600",
			Name:        "Online News",
			Description: "Look for what's new online",
		},
	},
	"8": {
		{
			ID:          "c625ac03-08cd-408b-b86e-10b6adf71036",
			Name:        "Online News",
			Description: "Look for what's new online",
		},
	},
}

var newsPaginatedTableData = model.PaginatedTableData{
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
