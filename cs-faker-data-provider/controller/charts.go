package controller

import (
	"fmt"
	"log"
	"sort"
	"strings"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/gofiber/fiber/v2"
)

// ChartController is a struct to manage charts
// but it is temporary and just for demo purposes
type ChartController struct{}

func NewChartController() *ChartController {
	return &ChartController{}
}

func (cc *ChartController) GetCharts(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	log.Printf("Charts for organization %s: %v", organizationId, chartsMap[organizationId])
	for _, chart := range chartsMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow{
			ID:          chart.ID,
			Name:        chart.Name,
			Description: chart.Description,
		})
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChart(c *fiber.Ctx) error {
	return c.JSON(cc.getChartByID(c))
}

func (scc *ChartController) GetSocialMediaPostsPerComponentLineChart(c *fiber.Ctx) error {
	organizationName := "5thype"
	fileName := "posts.json"
	fileName = fmt.Sprintf("%s-%s", organizationName, fileName)

	sc := NewSocialMediaController()
	socialMediaEntities, err := sc.getSocialMediaEntitiesFromFile(fileName)
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

func (scc *ChartController) GetSocialMediaPostsPerComponentBarChart(c *fiber.Ctx) error {
	organizationName := "5thype"
	fileName := "posts.json"
	fileName = fmt.Sprintf("%s-%s", organizationName, fileName)

	sc := NewSocialMediaController()
	socialMediaEntities, err := sc.getSocialMediaEntitiesFromFile(fileName)
	if err != nil {
		return c.JSON(model.SimpleBarChartData{BarData: []model.SimpleBarChartValue{}})
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
	bars := []model.SimpleBarChartValue{}
	for _, k := range keys {
		label := k
		if k == "" {
			label = "Missing"
		}
		bars = append(bars, model.SimpleBarChartValue{
			Label:         label,
			NumberOfPosts: float64(postsPerHashtag[k]),
		})
	}
	chartData := model.SimpleBarChartData{
		BarData: bars,
		BarColor: model.BarColor{
			NumberOfPosts: "#1DA1F2",
		},
	}
	return c.JSON(chartData)
}

func (cc *ChartController) getChartByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range chartsMap[organizationId] {
		if chart.ID == chartId {
			return chart
		}
	}
	return model.Chart{}
}

var chartsMap = map[string][]model.Chart{
	"4": {
		{
			ID:          "922e8e53-ffe8-4887-ae21-543674ad30d9",
			Name:        "Number of Posts",
			Description: "Number of posts shown using lines and bars charts.",
		},
	},
}

var chartsPaginatedTableData = model.PaginatedTableData{
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
