package controller

import (
	"fmt"
	"log"
	"sort"
	"strconv"
	"strings"

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
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				DureeMoyenneDeRechargeMin: "#323232",
			},
		},
	}

	rows, err := util.GetCSVRows("donnees_recharge_short_tidy", "*.csv", ';')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
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
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				HCPercentageConsummationkWH: "#87ceeb",
				HPPercentageConsummationkWH: "#1da2d8",
			},
		},
	}

	rows, err := util.GetCSVRows("donnees_conso_timechange_short_tidy", "*.csv", ';')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
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
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				HCConsummationkWH: "#87ceeb",
				HPConsummationkWH: "#1da2d8",
			},
		},
	}

	rows, err := util.GetCSVRows("donnees_conso_timechange_short_tidy", "*.csv", ';')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
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
			Periode2023: "pink",
			Challenge:   "green",
			Ecowatt:     "blue",
		},
		ReferenceLines: referenceLines,
	}

	rows, err := util.GetCSVRows("donnees_conso_timechange_short_tidy", "*.csv", ';')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
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

func (cc *ChartController) GetCharts5(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, chart := range charts5Map[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChart5(c *fiber.Ctx) error {
	return c.JSON(cc.getChart5ByID(c))
}

func (cc *ChartController) GetChart5Data(c *fiber.Ctx) error {
	chartData := model.SimpleBarChart5Data{
		BarData: []model.SimpleBarChart5Value{},
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				NombreMoyenDeRecharge: "#323232",
			},
		},
	}

	rows, err := util.GetCSVRows("chart5", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	bars := []model.SimpleBarChart5Value{}
	for i, row := range rows {
		if i == 0 {
			continue
		}
		day := row[0]
		terminals, err := strconv.ParseFloat(row[1], 64)
		if err != nil {
			log.Printf("Skipped row %d because failed ParseFloat of hConso with error: %v", i, err)
			continue
		}
		bars = append(bars, model.SimpleBarChart5Value{
			Label:                 day,
			NombreMoyenDeRecharge: terminals,
		})
	}

	chartData.BarData = bars
	return c.JSON(chartData)
}

func (cc *ChartController) getChart5ByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range charts5Map[organizationId] {
		if chart.ID == chartId {
			return chart
		}
	}
	return model.Chart{}
}

func (cc *ChartController) GetCharts4(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, chart := range charts4Map[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChart4(c *fiber.Ctx) error {
	return c.JSON(cc.getChart4ByID(c))
}

func (cc *ChartController) GetChart4Arrives2023(c *fiber.Ctx) error {
	chartData := model.SimpleBarChart4Data{
		BarData: []model.SimpleBarChart4Value{},
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				NombreDeRecharge: "#0047AB",
			},
			DataSuffix:     "-arrives2023",
			ReferenceLines: referenceLines,
		},
	}

	rows, err := util.GetCSVRows("chart4", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	bars := []model.SimpleBarChart4Value{}
	for i, row := range rows {
		if i == 0 {
			continue
		}
		hour := row[0]
		arrive2023, err := strconv.Atoi(row[1])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of arrive2023 with error: %v", i, err)
			continue
		}
		bars = append(bars, model.SimpleBarChart4Value{
			Label:            hour,
			NombreDeRecharge: arrive2023,
		})
	}

	chartData.BarData = bars
	return c.JSON(chartData)
}

func (cc *ChartController) GetChart4Departures2023(c *fiber.Ctx) error {
	chartData := model.SimpleBarChart4Data{
		BarData: []model.SimpleBarChart4Value{},
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				NombreDeRecharge: "#A52A2A",
			},
			DataSuffix:     "-departures2023",
			ReferenceLines: referenceLines,
		},
	}

	rows, err := util.GetCSVRows("chart4", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	bars := []model.SimpleBarChart4Value{}
	for i, row := range rows {
		if i == 0 {
			continue
		}
		hour := row[0]
		departure2023, err := strconv.Atoi(row[2])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of departure2023 with error: %v", i, err)
			continue
		}
		bars = append(bars, model.SimpleBarChart4Value{
			Label:            hour,
			NombreDeRecharge: departure2023,
		})
	}

	chartData.BarData = bars
	return c.JSON(chartData)
}

func (cc *ChartController) GetChart4ArrivesChallenge(c *fiber.Ctx) error {
	chartData := model.SimpleBarChart4Data{
		BarData: []model.SimpleBarChart4Value{},
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				NombreDeRecharge: "#6495ED",
			},
			DataSuffix:     "-arrivesChallenge",
			ReferenceLines: referenceLines,
		},
	}

	rows, err := util.GetCSVRows("chart4", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	bars := []model.SimpleBarChart4Value{}
	for i, row := range rows {
		if i == 0 {
			continue
		}
		hour := row[0]
		arriveChallenge, err := strconv.Atoi(row[3])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of arriveChallenge with error: %v", i, err)
			continue
		}
		bars = append(bars, model.SimpleBarChart4Value{
			Label:            hour,
			NombreDeRecharge: arriveChallenge,
		})
	}

	chartData.BarData = bars
	return c.JSON(chartData)
}

func (cc *ChartController) GetChart4DeparturesChallenge(c *fiber.Ctx) error {
	chartData := model.SimpleBarChart4Data{
		BarData: []model.SimpleBarChart4Value{},
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				NombreDeRecharge: "#D22B2B",
			},
			DataSuffix:     "-departuresChallenge",
			ReferenceLines: referenceLines,
		},
	}

	rows, err := util.GetCSVRows("chart4", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	bars := []model.SimpleBarChart4Value{}
	for i, row := range rows {
		if i == 0 {
			continue
		}
		hour := row[0]
		departureChallenge, err := strconv.Atoi(row[4])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of departureChallenge with error: %v", i, err)
			continue
		}
		bars = append(bars, model.SimpleBarChart4Value{
			Label:            hour,
			NombreDeRecharge: departureChallenge,
		})
	}

	chartData.BarData = bars
	return c.JSON(chartData)
}

func (cc *ChartController) GetChart4ArrivesEcowatt(c *fiber.Ctx) error {
	chartData := model.SimpleBarChart4Data{
		BarData: []model.SimpleBarChart4Value{},
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				NombreDeRecharge: "#1434A4",
			},
			DataSuffix:     "-arrivesEcowatt",
			ReferenceLines: referenceLines,
		},
	}

	rows, err := util.GetCSVRows("chart4", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	bars := []model.SimpleBarChart4Value{}
	for i, row := range rows {
		if i == 0 {
			continue
		}
		hour := row[0]
		arriveEcowatt, err := strconv.Atoi(row[5])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of arriveEcowatt with error: %v", i, err)
			continue
		}
		bars = append(bars, model.SimpleBarChart4Value{
			Label:            hour,
			NombreDeRecharge: arriveEcowatt,
		})
	}

	chartData.BarData = bars
	return c.JSON(chartData)
}

func (cc *ChartController) GetChart4DeparturesEcowatt(c *fiber.Ctx) error {
	chartData := model.SimpleBarChart4Data{
		BarData: []model.SimpleBarChart4Value{},
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				NombreDeRecharge: "#D2042D",
			},
			DataSuffix:     "-departuresEcowatt",
			ReferenceLines: referenceLines,
		},
	}

	rows, err := util.GetCSVRows("chart4", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	bars := []model.SimpleBarChart4Value{}
	for i, row := range rows {
		if i == 0 {
			continue
		}
		hour := row[0]
		departureEcowatt, err := strconv.Atoi(row[6])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of departureEcowatt with error: %v", i, err)
			continue
		}
		bars = append(bars, model.SimpleBarChart4Value{
			Label:            hour,
			NombreDeRecharge: departureEcowatt,
		})
	}

	chartData.BarData = bars
	return c.JSON(chartData)
}

func (cc *ChartController) getChart4ByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range charts4Map[organizationId] {
		if chart.ID == chartId {
			return chart
		}
	}
	return model.Chart{}
}

func (cc *ChartController) GetChartsCountryCounts(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, chart := range chartsCountryCountsMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChartCountryCounts(c *fiber.Ctx) error {
	return c.JSON(cc.getChartCountryCountsByID(c))
}

func (cc *ChartController) GetChartCountryCountsData(c *fiber.Ctx) error {
	chartData := model.SimpleBarChartCountryCountsData{
		BarData: []model.SimpleBarChartCountryCountsValue{},
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				Occurrences: "#6495ED",
			},
		},
	}

	rows, err := util.GetCSVRows("UniversitiesOFAlliancesCountryCounts", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	bars := []model.SimpleBarChartCountryCountsValue{}
	for i, row := range rows {
		if i == 0 {
			continue
		}
		country := row[0]
		occurrences, err := strconv.Atoi(row[1])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of occurrences with error: %v", i, err)
			continue
		}
		bars = append(bars, model.SimpleBarChartCountryCountsValue{
			Label:       country,
			Occurrences: occurrences,
		})
	}

	chartData.BarData = bars
	return c.JSON(chartData)
}

func (cc *ChartController) getChartCountryCountsByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range chartsCountryCountsMap[organizationId] {
		if chart.ID == chartId {
			return chart
		}
	}
	return model.Chart{}
}

func (cc *ChartController) GetChartsAlliancesPerGeneration(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, chart := range chartsAlliancesPerGenerationMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChartAlliancesPerGeneration(c *fiber.Ctx) error {
	return c.JSON(cc.getChartAlliancesPerGenerationByID(c))
}

func (cc *ChartController) GetChartAlliancesPerGenerationData(c *fiber.Ctx) error {
	chartData := model.SimpleBarChartAlliancesPerGenerationData{
		BarData: []model.SimpleBarChartAlliancesPerGenerationValue{},
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				Generation1: "pink",
				Generation2: "green",
				Generation3: "black",
				Generation4: "#6495ED",
			},
		},
	}

	rows, err := util.GetCSVRows("UniversitiesOFAlliancesAlliancesPerGeneration", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	barsMap := make(map[string]model.SimpleBarChartAlliancesPerGenerationValue)
	for i, row := range rows {
		if i == 0 {
			continue
		}
		country := row[0]
		generation := row[1]
		count, err := strconv.Atoi(row[2])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of count with error: %v", i, err)
			continue
		}
		bar, ok := barsMap[country]
		if !ok {
			bar = model.SimpleBarChartAlliancesPerGenerationValue{
				Label: country,
			}
		}
		if generation == "1" {
			bar.Generation1 = count
		}
		if generation == "2" {
			bar.Generation2 = count
		}
		if generation == "3" {
			bar.Generation3 = count
		}
		if generation == "4" {
			bar.Generation4 = count
		}
		barsMap[country] = bar
	}

	bars := []model.SimpleBarChartAlliancesPerGenerationValue{}
	for _, bar := range barsMap {
		bars = append(bars, bar)
	}

	sort.Sort(model.BarByLabel(bars))
	chartData.BarData = bars
	return c.JSON(chartData)
}

func (cc *ChartController) getChartAlliancesPerGenerationByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range chartsAlliancesPerGenerationMap[organizationId] {
		if chart.ID == chartId {
			return chart
		}
	}
	return model.Chart{}
}

func (cc *ChartController) GetChartsInvolvedUniversities(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, chart := range chartsInvolvedUniversitiesMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChartInvolvedUniversities(c *fiber.Ctx) error {
	return c.JSON(cc.getChartInvolvedUniversitiesByID(c))
}

func (cc *ChartController) GetChartInvolvedUniversitiesData(c *fiber.Ctx) error {
	chartData := model.SimpleBarChartInvolvedUniversitiesData{
		BarData: []model.SimpleBarChartInvolvedUniversitiesValue{},
		BaseSimpleBarChartData: model.BaseSimpleBarChartData{
			BarColor: model.BarColor{
				NumberOfUniversities: "red",
			},
		},
	}

	rows, err := util.GetCSVRows("AlliancesWithInvolvedUniversities", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	bars := []model.SimpleBarChartInvolvedUniversitiesValue{}
	for i, row := range rows {
		if i == 0 {
			continue
		}
		c := row[0]
		d, err := strconv.Atoi(row[1])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of d with error: %v", i, err)
			continue
		}
		bars = append(bars, model.SimpleBarChartInvolvedUniversitiesValue{
			Label:                c,
			NumberOfUniversities: d,
		})
	}
	sort.SliceStable(bars, func(i, j int) bool {
		iLabel, err := strconv.Atoi(bars[i].Label)
		if err != nil {
			return false
		}
		jLabel, err := strconv.Atoi(bars[j].Label)
		if err != nil {
			return false
		}
		return iLabel < jLabel
	})
	chartData.BarData = bars
	return c.JSON(chartData)
}

func (cc *ChartController) getChartInvolvedUniversitiesByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range chartsInvolvedUniversitiesMap[organizationId] {
		if chart.ID == chartId {
			return chart
		}
	}
	return model.Chart{}
}

func (cc *ChartController) GetChartsEuropeanAlliances(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	tableData := model.PaginatedTableData{
		Columns: chartsPaginatedTableData.Columns,
		Rows:    []model.PaginatedTableRow{},
	}
	for _, chart := range chartsEuropeanAlliancesMap[organizationId] {
		tableData.Rows = append(tableData.Rows, model.PaginatedTableRow(chart))
	}
	return c.JSON(tableData)
}

func (cc *ChartController) GetChartEuropeanAlliances(c *fiber.Ctx) error {
	return c.JSON(cc.getChartEuropeanAlliancesByID(c))
}

func (cc *ChartController) GetChartEuropeanAlliancesData(c *fiber.Ctx) error {
	chartData := model.SimpleLineChartEuropeanAlliancesData{
		LineData: []model.SimpleLineChartEuropeanAlliancesValue{},
		LineColor: model.LineColor{
			Italy:   "blue",
			France:  "pink",
			Ukraine: "red",
			Cyprus:  "#6495ED",
			Poland:  "black",
		},
	}

	rows, err := util.GetCSVRows("EuropeanAlliances", "*.csv", ',')
	if err != nil {
		log.Printf("Failed GetCSVRows with error: %v", err)
		return c.JSON(chartData)
	}

	linesMap := make(map[string]model.SimpleLineChartEuropeanAlliancesValue)
	for i, row := range rows {
		if i == 0 {
			continue
		}
		country := row[0]
		generation := row[1]
		count, err := strconv.Atoi(row[2])
		if err != nil {
			log.Printf("Skipped row %d because failed Atoi of count with error: %v", i, err)
			continue
		}
		line, ok := linesMap[generation]
		if !ok {
			line = model.SimpleLineChartEuropeanAlliancesValue{
				Label: generation,
			}
		}
		if country == "Italy" {
			line.Italy = count
		}
		if country == "France" {
			line.France = count
		}
		if country == "Ukraine" {
			line.Ukraine = count
		}
		if country == "Cyprus" {
			line.Cyprus = count
		}
		if country == "Poland" {
			line.Poland = count
		}
		linesMap[generation] = line
	}

	lines := []model.SimpleLineChartEuropeanAlliancesValue{}
	for _, bar := range linesMap {
		lines = append(lines, bar)
	}

	sort.SliceStable(lines, func(i, j int) bool {
		iLabel, err := strconv.Atoi(lines[i].Label)
		if err != nil {
			return false
		}
		jLabel, err := strconv.Atoi(lines[j].Label)
		if err != nil {
			return false
		}
		return iLabel < jLabel
	})

	chartData.LineData = lines
	return c.JSON(chartData)
}

func (cc *ChartController) getChartEuropeanAlliancesByID(c *fiber.Ctx) model.Chart {
	organizationId := c.Params("organizationId")
	chartId := c.Params("chartId")
	for _, chart := range chartsEuropeanAlliancesMap[organizationId] {
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
	"10": {
		{
			ID:          "cb8dfbc1-ddb4-4a24-b17c-11b5dba45d31",
			Name:        "Average charge duration depending on the periods",
			Description: "Average charge duration depending on the periods.",
		},
	},
	"11": {
		{
			ID:          "4a3d08d0-5dba-47f2-ba3e-21b9bb41b1e1",
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
	"10": {
		{
			ID:          "2460a50f-73ba-4f4f-9157-87da25a7e72b",
			Name:        "Consumption of terminals according on different periods %",
			Description: "Consumption of terminals according on different periods %.",
		},
	},
	"11": {
		{
			ID:          "952eb2a3-daa1-4da4-86f7-1d05a9c79634",
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
	"10": {
		{
			ID:          "b3b9a1ca-b210-4634-aac3-93f7caf21b60",
			Name:        "Consumption of terminals depending on different periods",
			Description: "Consumption of terminals depending on different periods.",
		},
	},
	"11": {
		{
			ID:          "5ae9354e-febb-4662-8955-c2bde64a49ee",
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
	"10": {
		{
			ID:          "2554c39a-7348-4799-aa08-b03bc8c67a7b",
			Name:        "Power called during a day according to different periods",
			Description: "Power called during a day according to different periods.",
		},
	},
	"11": {
		{
			ID:          "a7360057-0171-4ea6-b821-a46c725cb51e",
			Name:        "Power called during a day according to different periods",
			Description: "Power called during a day according to different periods.",
		},
	},
}

var charts5Map = map[string][]model.Chart{
	"9": {
		{
			ID:          "52f14a67-e084-4888-889b-1728ec5f0e54",
			Name:        "Average number of charges depending on the day of the week",
			Description: "Average number of charges depending on the day of the week.",
		},
	},
	"10": {
		{
			ID:          "b9512b2c-0770-4fb1-b372-0d9adc2b5abb",
			Name:        "Average number of charges depending on the day of the week",
			Description: "Average number of charges depending on the day of the week.",
		},
	},
	"11": {
		{
			ID:          "16071247-101f-4623-961c-0d679d20e06c",
			Name:        "Average number of charges depending on the day of the week",
			Description: "Average number of charges depending on the day of the week.",
		},
	},
}

var charts4Map = map[string][]model.Chart{
	"9": {
		{
			ID:          "4a7c706e-a375-4834-a30e-7b55d45e0093",
			Name:        "Number of arrivals, departures, according to the time",
			Description: "Number of arrivals, departures, according to the time.",
		},
	},
	"10": {
		{
			ID:          "09ec6ae7-8118-4f1b-b122-9853721f2d13",
			Name:        "Number of arrivals, departures, according to the time",
			Description: "Number of arrivals, departures, according to the time.",
		},
	},
	"11": {
		{
			ID:          "6d7f45eb-6dda-42f4-8b6d-a5b419b9432f",
			Name:        "Number of arrivals, departures, according to the time",
			Description: "Number of arrivals, departures, according to the time.",
		},
	},
}

var chartsCountryCountsMap = map[string][]model.Chart{
	"9": {
		{
			ID:          "7c2155c5-deb7-463f-b1ec-a7f718a29a3e",
			Name:        "Alleanze stipulate per Paese",
			Description: "Alleanze stipulate per Paese.",
		},
	},
	"10": {
		{
			ID:          "434d814f-9f30-4799-bb57-bc51c906b1b6",
			Name:        "Alleanze stipulate per Paese",
			Description: "Alleanze stipulate per Paese.",
		},
	},
	"11": {
		{
			ID:          "6efba994-9f16-4897-aa32-102e7b58c45d",
			Name:        "Alleanze stipulate per Paese",
			Description: "Alleanze stipulate per Paese.",
		},
	},
	"12": {
		{
			ID:          "73c0addc-36ab-4293-aad9-7c55de08e29a",
			Name:        "Alleanze stipulate per Paese",
			Description: "Alleanze stipulate per Paese.",
		},
	},
	"13": {
		{
			ID:          "d4c815bb-e11f-4ca4-b809-b92e3edeb8e0",
			Name:        "Alleanze stipulate per Paese",
			Description: "Alleanze stipulate per Paese.",
		},
	},
}

var chartsAlliancesPerGenerationMap = map[string][]model.Chart{
	"9": {
		{
			ID:          "05f53657-5fec-446f-b0b8-2a3fade8bcaf",
			Name:        "Paesi con numero di Alleanze stipulate per ogni Generazione",
			Description: "Paesi con numero di Alleanze stipulate per ogni Generazione.",
		},
	},
	"10": {
		{
			ID:          "6707f15d-7af2-45af-9f84-d381c0ad2971",
			Name:        "Paesi con numero di Alleanze stipulate per ogni Generazione",
			Description: "Paesi con numero di Alleanze stipulate per ogni Generazione.",
		},
	},
	"11": {
		{
			ID:          "b1702a07-c125-469c-95fe-a0b6911921d3",
			Name:        "Paesi con numero di Alleanze stipulate per ogni Generazione",
			Description: "Paesi con numero di Alleanze stipulate per ogni Generazione.",
		},
	},
	"12": {
		{
			ID:          "29d3b3d3-32ae-44ab-a5cf-0a8d37b8b879",
			Name:        "Paesi con numero di Alleanze stipulate per ogni Generazione",
			Description: "Paesi con numero di Alleanze stipulate per ogni Generazione.",
		},
	},
	"13": {
		{
			ID:          "e4dda46d-7bf4-451e-a227-891d1b0986b1",
			Name:        "Paesi con numero di Alleanze stipulate per ogni Generazione",
			Description: "Paesi con numero di Alleanze stipulate per ogni Generazione.",
		},
	},
}

var chartsInvolvedUniversitiesMap = map[string][]model.Chart{
	"9": {
		{
			ID:          "535d6cbe-2176-4000-b7d9-81b982e18963",
			Name:        "Numero di Università coinvolte per numero di Alleanze",
			Description: "Numero di Università coinvolte per numero di Alleanze.",
		},
	},
	"10": {
		{
			ID:          "cac45858-0d52-496c-b101-d02f40b2d0d7",
			Name:        "Numero di Università coinvolte per numero di Alleanze",
			Description: "Numero di Università coinvolte per numero di Alleanze.",
		},
	},
	"11": {
		{
			ID:          "61051955-a74d-4034-a12d-96697627f2c7",
			Name:        "Numero di Università coinvolte per numero di Alleanze",
			Description: "Numero di Università coinvolte per numero di Alleanze.",
		},
	},
	"12": {
		{
			ID:          "f0c5cd5c-2134-40ce-b3e6-60f4f8a80a02",
			Name:        "Numero di Università coinvolte per numero di Alleanze",
			Description: "Numero di Università coinvolte per numero di Alleanze.",
		},
	},
	"13": {
		{
			ID:          "204b4caf-03f0-4157-a1dc-e61c4a841c5e",
			Name:        "Numero di Università coinvolte per numero di Alleanze",
			Description: "Numero di Università coinvolte per numero di Alleanze.",
		},
	},
}

var chartsEuropeanAlliancesMap = map[string][]model.Chart{
	"9": {
		{
			ID:          "0dbc23ae-b6a0-4769-a35b-a438cddf90b2",
			Name:        "Numero di Alleanze Europee",
			Description: "Numero di Alleanze Europee.",
		},
	},
	"10": {
		{
			ID:          "a32e0537-f656-4eff-9f52-357834fefbc8",
			Name:        "Numero di Alleanze Europee",
			Description: "Numero di Alleanze Europee.",
		},
	},
	"11": {
		{
			ID:          "12a6fa10-6e51-43a3-baac-81a49958e103",
			Name:        "Numero di Alleanze Europee",
			Description: "Numero di Alleanze Europee.",
		},
	},
	"12": {
		{
			ID:          "6bf933f8-867a-4f93-a99f-d0beaadd3bc3",
			Name:        "Numero di Alleanze Europee",
			Description: "Numero di Alleanze Europee.",
		},
	},
	"13": {
		{
			ID:          "902f2923-51db-441a-a67d-e927a884336a",
			Name:        "Numero di Alleanze Europee",
			Description: "Numero di Alleanze Europee.",
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

var referenceLines = []model.ReferenceLine{
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
