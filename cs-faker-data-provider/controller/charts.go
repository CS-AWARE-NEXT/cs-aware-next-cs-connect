package controller

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"log"
	"sort"
	"strconv"
	"strings"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/data"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
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
	for _, chart := range chartsMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
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

func (cc *ChartController) GetCharts6(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, chart := range charts6Map[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChart6(c *fiber.Ctx) error {
	return c.JSON(cc.getChart6ByID(c))
}

func (cc *ChartController) GetChart6Data(c *fiber.Ctx) error {
	chartData := model.SimpleBarChart6Data{
		BarData: []model.SimpleBarChart6Value{},
		BarColor: model.BarColor{
			DureeMoyenneDeRechargeMin: "#323232",
		},
	}

	filePath, err := util.GetEmbeddedFilePath("donnees_recharge_short_tidy", "*.csv")
	if err != nil {
		log.Printf("Failed GetEmbeddedFilePath with error: %v", err)
		return c.JSON(chartData)
	}
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		log.Printf("Failed ReadFile with error: %v", err)
		return c.JSON(chartData)
	}
	bytesReader := bytes.NewReader(content)
	reader := csv.NewReader(bytesReader)
	reader.Comma = ';'

	rows, err := reader.ReadAll()
	if err != nil {
		log.Printf("Failed ReadAll with error: %v", err)
		return c.JSON(chartData)
	}

	periode2023 := 0
	total2023 := 0
	periodeChallenge := 0
	totalChallenge := 0
	for i, row := range rows {
		if i == 0 {
			continue
		}
		periode := row[1]
		chargingDuration, err := strconv.Atoi(row[8])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of hConso with error: %v", i, err)
			continue
		}

		if periode == "2023" {
			periode2023 += chargingDuration
			total2023++
		}
		if periode == "Challenge" {
			periodeChallenge += chargingDuration
			totalChallenge++
		}
	}

	chartData.BarData = append(chartData.BarData, model.SimpleBarChart6Value{
		Label:                     "2023",
		DureeMoyenneDeRechargeMin: fmt.Sprintf("%d", int32(periode2023)/int32(total2023)),
	})
	chartData.BarData = append(chartData.BarData, model.SimpleBarChart6Value{
		Label:                     "Challenge",
		DureeMoyenneDeRechargeMin: fmt.Sprintf("%d", int32(periodeChallenge)/int32(totalChallenge)),
	})

	return c.JSON(chartData)
}

func (cc *ChartController) getChart6ByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range charts6Map[organizationId] {
		if chart.ID == chartId {
			return chart
		}
	}
	return model.Chart{}
}

func (cc *ChartController) GetCharts3(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, chart := range charts3Map[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChart3(c *fiber.Ctx) error {
	return c.JSON(cc.getChart3ByID(c))
}

func (cc *ChartController) GetChart3Data(c *fiber.Ctx) error {
	chartData := model.SimpleBarChart3Data{
		BarData: []model.SimpleBarChart3Value{},
		BarColor: model.BarColor{
			HCPercentageConsummationkWH: "#87ceeb",
			HPPercentageConsummationkWH: "#1da2d8",
		},
	}

	filePath, err := util.GetEmbeddedFilePath("donnees_conso_timechange_short_tidy", "*.csv")
	if err != nil {
		log.Printf("Failed GetEmbeddedFilePath with error: %v", err)
		return c.JSON(chartData)
	}
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		log.Printf("Failed ReadFile with error: %v", err)
		return c.JSON(chartData)
	}
	bytesReader := bytes.NewReader(content)
	reader := csv.NewReader(bytesReader)
	reader.Comma = ';'

	rows, err := reader.ReadAll()
	if err != nil {
		log.Printf("Failed ReadAll with error: %v", err)
		return c.JSON(chartData)
	}

	hc2023 := 0.0
	hp2023 := 0.0
	total2023 := 0.0

	hcChallenge := 0.0
	hpChallenge := 0.0
	totalChallenge := 0.0

	hcEcowatt := 0.0
	hpEcowatt := 0.0
	totalEcowatt := 0.0

	for i, row := range rows {
		if i == 0 {
			continue
		}
		periode := row[7]
		hphc := row[2]
		consumption, err := strconv.ParseFloat(row[8], 32)
		if err != nil {
			log.Printf("Skipped row %d because failed ParseFloat of consumption with error: %v", i, err)
			continue
		}

		if periode == "2023" {
			if hphc == "HC" {
				hc2023 += consumption
			} else {
				hp2023 += consumption
			}
			total2023 += consumption
		}
		if periode == "Challenge" {
			if hphc == "HC" {
				hcChallenge += consumption
			} else {
				hpChallenge += consumption
			}
			totalChallenge += consumption
		}
		if periode == "Ecowatt" {
			if hphc == "HC" {
				hcEcowatt += consumption
			} else {
				hpEcowatt += consumption
			}
			totalEcowatt += consumption
		}
	}

	// log.Printf("2023 -> HC: %2.f, HP: %2.f, Total: %2.f, pHC: %d, pHP: %d", hc2023, hp2023, total2023, int((float32(hc2023)/float32(total2023))*100), int((float32(hp2023)/float32(total2023))*100))
	// log.Printf("Challenge -> HC: %2.f, HP: %2.f, Total: %2.f, pHC: %d, pHP: %d", hcChallenge, hpChallenge, totalChallenge, int((float32(hcChallenge)/float32(totalChallenge))*100), int((float32(hpChallenge)/float32(totalChallenge))*100))
	// log.Printf("Ecowatt -> HC: %2.f, HP: %2.f, Total: %2.f, pHC: %d, pHP: %d", hcEcowatt, hpEcowatt, totalEcowatt, int((float32(hcEcowatt)/float32(totalEcowatt))*100), int((float32(hpEcowatt)/float32(totalEcowatt))*100))

	chartData.BarData = append(chartData.BarData, model.SimpleBarChart3Value{
		Label:                       "2023",
		HCPercentageConsummationkWH: fmt.Sprintf("%d", int((float32(hc2023)/float32(total2023))*100)),
		HPPercentageConsummationkWH: fmt.Sprintf("%d", int((float32(hp2023)/float32(total2023))*100)),
	})
	chartData.BarData = append(chartData.BarData, model.SimpleBarChart3Value{
		Label:                       "Challenge",
		HCPercentageConsummationkWH: fmt.Sprintf("%d", int((float32(hcChallenge)/float32(totalChallenge))*100)),
		HPPercentageConsummationkWH: fmt.Sprintf("%d", int((float32(hpChallenge)/float32(totalChallenge))*100)),
	})
	chartData.BarData = append(chartData.BarData, model.SimpleBarChart3Value{
		Label:                       "Ecowatt",
		HCPercentageConsummationkWH: fmt.Sprintf("%d", int((float32(hcEcowatt)/float32(totalEcowatt))*100)),
		HPPercentageConsummationkWH: fmt.Sprintf("%d", int((float32(hpEcowatt)/float32(totalEcowatt))*100)),
	})

	return c.JSON(chartData)
}

func (cc *ChartController) getChart3ByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range charts3Map[organizationId] {
		if chart.ID == chartId {
			return chart
		}
	}
	return model.Chart{}
}

func (cc *ChartController) GetCharts2(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, chart := range charts2Map[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChart2(c *fiber.Ctx) error {
	return c.JSON(cc.getChart2ByID(c))
}

func (cc *ChartController) GetChart2Data(c *fiber.Ctx) error {
	chartData := model.SimpleBarChart2Data{
		BarData: []model.SimpleBarChart2Value{},
		BarColor: model.BarColor{
			HCConsummationkWH: "#87ceeb",
			HPConsummationkWH: "#1da2d8",
		},
	}

	filePath, err := util.GetEmbeddedFilePath("donnees_conso_timechange_short_tidy", "*.csv")
	if err != nil {
		log.Printf("Failed GetEmbeddedFilePath with error: %v", err)
		return c.JSON(chartData)
	}
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		log.Printf("Failed ReadFile with error: %v", err)
		return c.JSON(chartData)
	}
	bytesReader := bytes.NewReader(content)
	reader := csv.NewReader(bytesReader)
	reader.Comma = ';'

	rows, err := reader.ReadAll()
	if err != nil {
		log.Printf("Failed ReadAll with error: %v", err)
		return c.JSON(chartData)
	}

	hc2023 := 0.0
	hp2023 := 0.0

	hcChallenge := 0.0
	hpChallenge := 0.0

	hcEcowatt := 0.0
	hpEcowatt := 0.0

	for i, row := range rows {
		if i == 0 {
			continue
		}
		periode := row[7]
		hphc := row[2]
		consumption, err := strconv.ParseFloat(row[8], 32)
		if err != nil {
			log.Printf("Skipped row %d because failed ParseFloat of consumption with error: %v", i, err)
			continue
		}

		if periode == "2023" {
			if hphc == "HC" {
				hc2023 += consumption
			} else {
				hp2023 += consumption
			}
		}
		if periode == "Challenge" {
			if hphc == "HC" {
				hcChallenge += consumption
			} else {
				hpChallenge += consumption
			}
		}
		if periode == "Ecowatt" {
			if hphc == "HC" {
				hcEcowatt += consumption
			} else {
				hpEcowatt += consumption
			}
		}
	}

	// log.Printf("2023 -> HC: %2.f, HP: %2.f", hc2023, hp2023)
	// log.Printf("Challenge -> HC: %2.f, HP: %2.f", hcChallenge, hpChallenge)
	// log.Printf("Ecowatt -> HC: %2.f, HP: %2.f", hcEcowatt, hpEcowatt)

	chartData.BarData = append(chartData.BarData, model.SimpleBarChart2Value{
		Label:             "2023",
		HCConsummationkWH: fmt.Sprintf("%d", int(hc2023)),
		HPConsummationkWH: fmt.Sprintf("%d", int(hp2023)),
	})
	chartData.BarData = append(chartData.BarData, model.SimpleBarChart2Value{
		Label:             "Challenge",
		HCConsummationkWH: fmt.Sprintf("%d", int(hcChallenge)),
		HPConsummationkWH: fmt.Sprintf("%d", int(hpChallenge)),
	})
	chartData.BarData = append(chartData.BarData, model.SimpleBarChart2Value{
		Label:             "Ecowatt",
		HCConsummationkWH: fmt.Sprintf("%d", int(hcEcowatt)),
		HPConsummationkWH: fmt.Sprintf("%d", int(hpEcowatt)),
	})

	return c.JSON(chartData)
}

func (cc *ChartController) getChart2ByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range charts2Map[organizationId] {
		if chart.ID == chartId {
			return chart
		}
	}
	return model.Chart{}
}

func (cc *ChartController) GetCharts1(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, chart := range charts1Map[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChart1(c *fiber.Ctx) error {
	return c.JSON(cc.getChart1ByID(c))
}

func (cc *ChartController) GetChart1Data(c *fiber.Ctx) error {
	lineData := model.SimpleLineChart1Data{
		LineData: []model.SimpleLineChart1Value{},
		LineColor: model.LineColor{
			Periode2023: "orange",
			Challenge:   "green",
			Ecowatt:     "blue",
		},
	}

	filePath, err := util.GetEmbeddedFilePath("donnees_conso_timechange_short_tidy", "*.csv")
	if err != nil {
		log.Printf("Failed GetEmbeddedFilePath with error: %v", err)
		return c.JSON(lineData)
	}
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		log.Printf("Failed ReadFile with error: %v", err)
		return c.JSON(lineData)
	}
	bytesReader := bytes.NewReader(content)
	reader := csv.NewReader(bytesReader)
	reader.Comma = ';'

	rows, err := reader.ReadAll()
	if err != nil {
		log.Printf("Failed ReadAll with error: %v", err)
		return c.JSON(lineData)
	}

	periodeMap := make(model.PeriodeMap)
	for i, row := range rows {
		if i == 0 {
			continue
		}
		periode := row[7]
		hConso := row[5]
		hConsoFloat, err := strconv.ParseFloat(row[1], 64)
		if err != nil {
			log.Printf("Skipped row %d because failed ParseFloat of hConso with error: %v", i, err)
			continue
		}

		hConsoMap, ok := periodeMap[periode]
		if !ok {
			hConsoMap = make(model.HConsoMap)
			periodeMap[periode] = hConsoMap
		}
		hConsoValue, ok := hConsoMap[hConso]
		if !ok {
			hConsoValue = model.HConsoValue{
				TotalPuissance: hConsoFloat,
				Count:          1,
			}
			hConsoMap[hConso] = hConsoValue
			periodeMap[periode] = hConsoMap
			continue
		}
		hConsoValue.TotalPuissance += hConsoFloat
		hConsoValue.Count++
		hConsoMap[hConso] = hConsoValue
		periodeMap[periode] = hConsoMap
	}

	lines := []model.SimpleLineChart1Value{}
	for periode, hConsoMap := range periodeMap {
		for hConso, hConsoValue := range hConsoMap {
			if periode == "2023" {
				lines = append(lines, model.SimpleLineChart1Value{
					Label:       hConso,
					Periode2023: int64(hConsoValue.TotalPuissance / float64(hConsoValue.Count)),
				})
			}
			if periode == "Challenge" {
				lines = append(lines, model.SimpleLineChart1Value{
					Label:     hConso,
					Challenge: int64(hConsoValue.TotalPuissance / float64(hConsoValue.Count)),
				})
			}
			if periode == "Ecowatt" {
				lines = append(lines, model.SimpleLineChart1Value{
					Label:   hConso,
					Ecowatt: int64(hConsoValue.TotalPuissance / float64(hConsoValue.Count)),
				})
			}
		}
	}

	aggregatedBYHConso := make(map[string]model.SimpleLineChart1Value)
	for _, line := range lines {
		lineValue, ok := aggregatedBYHConso[line.Label]
		if !ok {
			aggregatedBYHConso[line.Label] = line
			continue
		}
		if line.Periode2023 != 0 {
			lineValue.Periode2023 = line.Periode2023
		}
		if line.Challenge != 0 {
			lineValue.Challenge = line.Challenge
		}
		if line.Ecowatt != 0 {
			lineValue.Ecowatt = line.Ecowatt
		}
		aggregatedBYHConso[line.Label] = lineValue
	}

	aggregatedLines := []model.SimpleLineChart1Value{}
	for _, line := range aggregatedBYHConso {
		aggregatedLines = append(aggregatedLines, line)
	}

	sort.Sort(model.ByLabel(aggregatedLines))
	lineData.LineData = aggregatedLines
	lineData.ReferenceLines = []model.ReferenceLine{
		{
			X:      "7",
			Stroke: "red",
			Label:  "",
		},
		{
			X:      "11",
			Stroke: "red",
			Label:  "",
		},
		{
			X:      "18",
			Stroke: "red",
			Label:  "",
		},
		{
			X:      "20",
			Stroke: "red",
			Label:  "",
		},
	}
	return c.JSON(lineData)
}

func (cc *ChartController) getChart1ByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range charts1Map[organizationId] {
		if chart.ID == chartId {
			return chart
		}
	}
	return model.Chart{}
}

var chartsMap = map[string][]model.Chart{
	"9": {
		{
			ID:          "922e8e53-ffe8-4887-ae21-543674ad30d9",
			Name:        "Number of Posts",
			Description: "Number of posts shown using lines and bars charts.",
		},
	},
}

var charts6Map = map[string][]model.Chart{
	"9": {
		{
			ID:          "e9858426-5a90-4710-8d08-3fe6d4ae69e0",
			Name:        "Average charge duration depending on the periods",
			Description: "Average charge duration depending on the periods.",
		},
	},
}

var charts3Map = map[string][]model.Chart{
	"9": {
		{
			ID:          "bd24c04f-e334-433c-bd2a-4dfb025b3b3a",
			Name:        "Consumption of terminals according on different periods %",
			Description: "Consumption of terminals according on different periods %.",
		},
	},
}

var charts2Map = map[string][]model.Chart{
	"9": {
		{
			ID:          "d4078e0d-f089-4e8a-aaff-807f76a856f6",
			Name:        "Consumption of terminals depending on different periods",
			Description: "Consumption of terminals depending on different periods.",
		},
	},
}

var charts1Map = map[string][]model.Chart{
	"9": {
		{
			ID:          "13efcab0-d161-4f2f-9416-458175b79697",
			Name:        "Power called during a day according to different periods",
			Description: "Power called during a day according to different periods.",
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
