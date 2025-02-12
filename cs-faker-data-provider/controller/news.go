package controller

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/repository"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/service"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

type NewsController struct {
	newsRepository *repository.NewsRepository
	endpoint       string
	authService    *service.AuthService
}

func NewNewsController(
	newsRepository *repository.NewsRepository,
	endpoint string,
	authService *service.AuthService,
) *NewsController {
	return &NewsController{
		newsRepository: newsRepository,
		endpoint:       endpoint,
		authService:    authService,
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

func (nc *NewsController) GetNewsPosts(c *fiber.Ctx, vars map[string]string) error {
	log.Info("preparing for request at ", nc.endpoint)
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
		// desc retrieves the newest first, so we are using it as default
		direction = "desc"
	}

	log.Info("creating body ", search, " ", offset, " ", offsetInt, " ", limit, " ", limitInt, " ", orderBy, " ", direction)
	keywords := strings.Split(search, " ")

	// This is the oldest NewerThan date (provided by Peter)
	// NewerThan:      "2021-12-13T13:57:11.819492600Z",
	targetLanguage := "en"

	// sourceType := "twitter"
	queryString := fmt.Sprintf(
		"targetLanguage=%s&offset=%s&limit=%s&newerThan=2024-10-14T00:00:00&order_by=%s&direction=%s",
		targetLanguage,
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
		nc.endpoint+"?"+queryString,
		bytes.NewBuffer(body),
	)
	if err != nil {
		log.Error("error creating request ", err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": err.Error()})
	}
	req.Header.Set("Content-Type", "application/json")

	log.Info("authenticating to get token")
	authResp, err := nc.authService.Auth(vars["authUsername"], vars["authPassword"])
	if err != nil {
		log.Error("error authenticating ", err.Error())
		c.Status(fiber.StatusInternalServerError)
		return c.JSON(fiber.Map{"error": err.Error()})
	}
	log.Infof("Got token: %s", authResp.String())
	req.Header.Set("access-token", authResp.AccessToken)

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
	log.Info("News response body with no json convertion: ", string(respBody))

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
