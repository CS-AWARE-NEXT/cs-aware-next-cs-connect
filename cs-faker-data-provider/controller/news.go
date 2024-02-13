package controller

import (
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/gofiber/fiber/v2"
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
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow{
			ID:          news.ID,
			Name:        news.Name,
			Description: news.Description,
		})
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

var newsMap = map[string][]model.News{
	"5": {
		{
			ID:          "969b347f-89c0-4f5c-826c-510ae483b58e",
			Name:        "News from Social Media",
			Description: "Look for what's new on Social Media",
		},
	},
	"6": {
		{
			ID:          "bb839490-8306-4ea1-8bff-bed135ac8016",
			Name:        "News from Social Media",
			Description: "Look for what's new on Social Media",
		},
	},
	"7": {
		{
			ID:          "96f88d4f-5728-49c2-a97a-e8722860a600",
			Name:        "News from Social Media",
			Description: "Look for what's new on Social Media",
		},
	},
	"8": {
		{
			ID:          "c625ac03-08cd-408b-b86e-10b6adf71036",
			Name:        "News from Social Media",
			Description: "Look for what's new on Social Media",
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
