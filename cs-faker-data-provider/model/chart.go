package model

import "strconv"

type SimpleLineChartData struct {
	LineData       []SimpleLineChartValue `json:"lineData"`
	LineColor      LineColor              `json:"lineColor"`
	ReferenceLines []ReferenceLine        `json:"referenceLines"`
}

type SimpleLineChartValue struct {
	Label         string  `json:"label"`
	NumberOfPosts float64 `json:"numberOfPosts"`
}

type SimpleLineChart1Data struct {
	LineData       []SimpleLineChart1Value `json:"lineData"`
	LineColor      LineColor               `json:"lineColor"`
	ReferenceLines []ReferenceLine         `json:"referenceLines"`
}

type SimpleLineChart1Value struct {
	Label       string `json:"label"`
	Periode2023 int64  `json:"2023"`
	Challenge   int64  `json:"challenge"`
	Ecowatt     int64  `json:"ecowatt"`
}

type LineColor struct {
	NumberOfPosts string `json:"numberOfPosts"`
	Periode2023   string `json:"2023"`
	Challenge     string `json:"challenge"`
	Ecowatt       string `json:"ecowatt"`
}

type ReferenceLine struct {
	X      string `json:"x"`
	Stroke string `json:"stroke"`
	Label  string `json:"label"`
}

type SimpleBarChartData struct {
	BarData  []SimpleBarChartValue `json:"barData"`
	BarColor BarColor              `json:"barColor"`
}

type SimpleBarChartValue struct {
	Label         string  `json:"label"`
	NumberOfPosts float64 `json:"numberOfPosts"`
}

type SimpleBarChart6Data struct {
	BarData  []SimpleBarChart6Value `json:"barData"`
	BarColor BarColor               `json:"barColor"`
}

type SimpleBarChart6Value struct {
	Label                     string `json:"label"`
	DureeMoyenneDeRechargeMin string `json:"dureeMoyenneDeRechargeMin"`
}

type SimpleBarChart3Data struct {
	BarData  []SimpleBarChart3Value `json:"barData"`
	BarColor BarColor               `json:"barColor"`
}

type SimpleBarChart3Value struct {
	Label                       string `json:"label"`
	HCPercentageConsummationkWH string `json:"HCPercentageConsummationkWH"`
	HPPercentageConsummationkWH string `json:"HPPercentageConsummationkWH"`
}

type SimpleBarChart2Data struct {
	BarData  []SimpleBarChart2Value `json:"barData"`
	BarColor BarColor               `json:"barColor"`
}

type SimpleBarChart2Value struct {
	Label             string `json:"label"`
	HCConsummationkWH string `json:"HCConsummationkWH"`
	HPConsummationkWH string `json:"HPConsummationkWH"`
}

type SimpleBarChartCountryCountsData struct {
	BarData  []SimpleBarChartCountryCountsValue `json:"barData"`
	BarColor BarColor                           `json:"barColor"`
}

type SimpleBarChartCountryCountsValue struct {
	Label       string `json:"label"`
	Occurrences int    `json:"occurrences"`
}

type SimpleBarChartAlliancesPerGenerationData struct {
	BarData  []SimpleBarChartAlliancesPerGenerationValue `json:"barData"`
	BarColor BarColor                                    `json:"barColor"`
}

type SimpleBarChartAlliancesPerGenerationValue struct {
	Label       string `json:"label"`
	Generation1 int    `json:"1"`
	Generation2 int    `json:"2"`
	Generation3 int    `json:"3"`
	Generation4 int    `json:"4"`
}

type BarColor struct {
	NumberOfPosts               string `json:"numberOfPosts"`
	DureeMoyenneDeRechargeMin   string `json:"dureeMoyenneDeRechargeMin"`
	HCPercentageConsummationkWH string `json:"HCPercentageConsummationkWH"`
	HPPercentageConsummationkWH string `json:"HPPercentageConsummationkWH"`
	HCConsummationkWH           string `json:"HCConsummationkWH"`
	HPConsummationkWH           string `json:"HPConsummationkWH"`
	Occurrences                 string `json:"occurrences"`
	Generation1                 string `json:"1"`
	Generation2                 string `json:"2"`
	Generation3                 string `json:"3"`
	Generation4                 string `json:"4"`
}

type PeriodeMap = map[string]HConsoMap

type HConsoMap = map[string]HConsoValue

type HConsoValue struct {
	TotalPuissance float64 `json:"totalPuissance"`
	Count          int32   `json:"count"`
}

// ByLabel implements sort.Interface for []SimpleLineChart1Value based on the Label field.
type ByLabel []SimpleLineChart1Value

func (a ByLabel) Len() int {
	return len(a)
}

func (a ByLabel) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}

func (a ByLabel) Less(i, j int) bool {
	labelI, errI := strconv.Atoi(a[i].Label)
	labelJ, errJ := strconv.Atoi(a[j].Label)
	if errI != nil || errJ != nil {
		return a[i].Label < a[j].Label
	}
	return labelI < labelJ
}
