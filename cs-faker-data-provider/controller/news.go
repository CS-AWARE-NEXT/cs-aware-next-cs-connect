package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

type NewsController struct {
	newsRepository *repository.NewsRepository
}

func NewNewsController(newsRepository *repository.NewsRepository) *NewsController {
	return &NewsController{
		newsRepository: newsRepository,
	}
}

func (nc *NewsController) GetAllNews(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	log.Infof("Getting news for org %s", organizationId)

	tableData := model.PaginatedTableData{
		Columns: socialMediaPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}

	news, err := nc.newsRepository.GetNewsByOrganizationID(organizationId)
	if err != nil {
		log.Infof("Could not get news: %s", err.Error())
		return c.JSON(tableData)
	}

	for _, n := range news {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow{
			ID:          n.ID,
			Name:        n.Name,
			Description: n.Description,
		})
	}

	log.Infof("Got all news for org %s", organizationId)
	return c.JSON(tableData)
}

func (nc *NewsController) GetNewsByID(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	newsId := c.Params("newsId")
	log.Infof("Getting news for org %s and newsId %s", organizationId, newsId)
	news, err := nc.newsRepository.GetNewsByID(newsId)
	if err != nil {
		log.Errorf("Could not get news: %s", err.Error())
		return c.JSON(fiber.Map{"error": "cannot get news by ID"})
	}
	log.Infof("Got news: %s", news.Name)
	return c.JSON(news)
}

func (nc *NewsController) SaveNews(c *fiber.Ctx) error {
	log.Infof("SaveNews -> Request body: %s", c.Body())
	var newsBody model.News
	err := json.Unmarshal(c.Body(), &newsBody)
	if err != nil {
		return c.JSON(fiber.Map{
			"error": "Not a valid news provided",
		})
	}

	newsEntity := model.NewsEntity{
		ID:             newsBody.ID,
		Name:           newsBody.Name,
		Description:    newsBody.Description,
		OrganizationId: newsBody.OrganizationId,
	}
	log.Infof("Saving news %s", newsEntity.Name)
	if newsEntity.ID == "" {
		news, err := nc.newsRepository.SaveNews(newsEntity)
		if err != nil {
			log.Errorf("Could not save news: %s", err.Error())
			return c.JSON(fiber.Map{"error": "cannot save news"})
		}
		return c.JSON(news)
	} else {
		splitted := strings.Split(newsEntity.ID, "_")
		oldID := splitted[0]
		newID := splitted[1]
		nc.newsRepository.DeleteNewsByID(oldID)
		newsEntity.ID = newID
		news, err := nc.newsRepository.SaveNews(newsEntity)
		if err != nil {
			log.Errorf("Could not save news: %s", err.Error())
			return c.JSON(fiber.Map{"error": "cannot save news"})
		}
		return c.JSON(news)
	}
}

func (nc *NewsController) DeleteNews(c *fiber.Ctx) error {
	newsId := c.Params("newsId")
	nc.newsRepository.DeleteNewsByID(newsId)
	return c.JSON(fiber.Map{
		"deleted": newsId,
	})
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

	orderBy := c.Query("orderBy")
	if orderBy == "" {
		orderBy = "observation_created"
	}
	direction := c.Query("direction")
	if direction == "" {
		direction = "asc"
	}

	log.Info("creating body ", search, " ", offset, " ", offsetInt, " ", limit, " ", limitInt, " ", orderBy, " ", direction)
	keywords := strings.Split(search, " ")

	// This is the oldest NewerThan date (provided by Peter)
	// NewerThan:      "2021-12-13T13:57:11.819492600Z",
	targetLanguage := "en"
	sourceType := "twitter"
	queryString := fmt.Sprintf(
		"targetLanguage=%s&sourceType=%s&offset=%s&limit=%s&newerThan=2024-10-14T00:00:00&order_by=%s&direction=%s",
		targetLanguage,
		sourceType,
		offset,
		limit,
		orderBy,
		direction,
	)
	body, err := json.Marshal(model.DatalakeNewsPostBody{
		Keywords: keywords,
	})
	if err != nil {
		log.Error("error creating body ", err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": err.Error()})
	}

	log.Info("creating request ", keywords, " ", queryString)
	req, err := http.NewRequest(
		"POST",
		newsEndpoint+"?"+queryString,
		bytes.NewBuffer(body),
	)
	if err != nil {
		log.Error("error creating request ", err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": err.Error()})
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("access-token", "eyJraWQiOiJ4VXNkQnY3U3VyRHE4bUJkd3llZDRtdWdSa3ZtT1Arb1pBMlFLVXEzVmFvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5MjA1MjQ1NC1hMGQxLTcwMGQtOTdmMS1iNmJiMTkzNzY3MmUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV82NFo0T3JBSmkiLCJjbGllbnRfaWQiOiI3cWJka3RvbTFjNjhtcm1wc2JwYTVzZ2doNCIsIm9yaWdpbl9qdGkiOiIwNzlmZjE0Zi03OTdiLTRhODQtODE5ZS1hZDhhM2JjYjliMDUiLCJldmVudF9pZCI6Ijc2YzQ2YjBmLTQ0NDUtNDQ1ZS05YmNlLWZhOTU4YTVmMmEzNCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE3MzE1ODU3NTcsImV4cCI6MTczMTY3MjE1NywiaWF0IjoxNzMxNTg1NzU3LCJqdGkiOiIwOTUxMTBjYy1hMjMzLTQ4NjMtOWNmMC1mYTc4N2UxNzBiNmQiLCJ1c2VybmFtZSI6InVuaXNhIn0.MD1GL1yPeyDMJw3cVlHQqcwMo48GI3KwND3j3b4VpHgk-n_8SgoZg2I_fqzQGSxz9kQbsO5CZ24N1TjLHGzNbea278ZITu8UNyuObNbrm_r4EdxxU-4_v2BFhZmoUjHf3ji--Fs66gvaN0Nn32jklzgVQ6xDWLQRQrnA0lfxg6vCWDF3k4Jo5Is1eoouCFR0di33CDA7Ubdp2gdjJOrqPSMJ3q8JyKkBIIQmMXaJdkjc1l2hPIGG7FjSI9QEjPgeQCacI5SHIYfguUYk7nbgoYuq8us4n-iCWpJZEKhdcY7diUrsO7KrYCxbkjC7H9hCgU_GUVLS0S_jjXMFOB-LpQ")

	log.Info("requesting news posts")

	// TODO: try this to fix the error under HTTPS on AWS
	// client := &http.Client{
	// 	Transport: &http.Transport{
	// 		TLSClientConfig: &tls.Config{
	// 			InsecureSkipVerify: true, // Use only for testing, not in production
	// 		},
	// 	},
	// }

	// client := &http.Client{}

	transport := &http.Transport{}
	client := &http.Client{Transport: transport}

	resp, err := client.Do(req)
	if err != nil {
		log.Error("error requesting news posts ", err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": err.Error()})
	}
	defer resp.Body.Close()
	defer transport.CloseIdleConnections()

	log.Info("Response Status: ", resp.Status)
	log.Info("Response Headers: ", resp.Header)
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("error reading response body ", string(respBody), err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": err.Error()})
	}
	// log.Info("Response body with no json convertion: ", string(respBody))

	log.Info("unmarshaling news posts")
	var newsPosts model.NewsPostsV2
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
	newsPosts model.NewsPostsV2,
) model.SocialMediaPostData {
	posts := []model.SocialMediaPost{}
	log.Info("parsing news posts ", len(newsPosts.Entries), " ", newsPosts.PageInfo.TotalCount)
	for _, post := range newsPosts.Entries {
		log.Info("parsing news post with title ", post.Title)
		postId := post.PostID
		posts = append(posts, model.SocialMediaPost{
			ID:      postId,
			Title:   post.AccountDisplayName,
			Date:    post.ObservationCreated,
			Content: nc.buildContent(post.Title, post.Body),
			URL:     postId,
		})
		log.Info("finished parsing news post with title ", post.Title)
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

// var newsMap = map[string][]model.News{
// 	"5": {
// 		{
// 			ID:          "969b347f-89c0-4f5c-826c-510ae483b58e",
// 			Name:        "Online News",
// 			Description: "Look for what's new online",
// 		},
// 	},
// 	"6": {
// 		{
// 			ID:          "bb839490-8306-4ea1-8bff-bed135ac8016",
// 			Name:        "Online News",
// 			Description: "Look for what's new online",
// 		},
// 	},
// 	"7": {
// 		{
// 			ID:          "96f88d4f-5728-49c2-a97a-e8722860a600",
// 			Name:        "Online News",
// 			Description: "Look for what's new online",
// 		},
// 	},
// 	"8": {
// 		{
// 			ID:          "c625ac03-08cd-408b-b86e-10b6adf71036",
// 			Name:        "Online News",
// 			Description: "Look for what's new online",
// 		},
// 	},
// }

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
