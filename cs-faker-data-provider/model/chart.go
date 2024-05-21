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

type SimpleLineChartEuropeanAlliancesData struct {
	LineData  []SimpleLineChartEuropeanAlliancesValue `json:"lineData"`
	LineColor LineColor                               `json:"lineColor"`
}

type SimpleLineChartEuropeanAlliancesValue struct {
	Label   string `json:"label"`
	Italy   int    `json:"italy"`
	France  int    `json:"france"`
	Cyprus  int    `json:"cyprus"`
	Poland  int    `json:"poland"`
	Ukraine int    `json:"ukraine"`
}

type LineColor struct {
	NumberOfPosts string `json:"numberOfPosts"`
	Periode2023   string `json:"2023"`
	Challenge     string `json:"challenge"`
	Ecowatt       string `json:"ecowatt"`
	Italy         string `json:"italy"`
	France        string `json:"france"`
	Cyprus        string `json:"cyprus"`
	Poland        string `json:"poland"`
	Ukraine       string `json:"ukraine"`
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

type BaseSimpleBarChartData struct {
	BarColor       BarColor        `json:"barColor"`
	DataSuffix     string          `json:"dataSuffix"`
	ReferenceLines []ReferenceLine `json:"referenceLines"`
}

type SimpleBarChartValue struct {
	Label         string  `json:"label"`
	NumberOfPosts float64 `json:"numberOfPosts"`
}

type SimpleBarChart6Data struct {
	BaseSimpleBarChartData
	BarData []SimpleBarChart6Value `json:"barData"`
}

type SimpleBarChart6Value struct {
	Label                     string `json:"label"`
	DureeMoyenneDeRechargeMin string `json:"dureeMoyenneDeRechargeMin"`
}

type SimpleBarChart3Data struct {
	BaseSimpleBarChartData
	BarData []SimpleBarChart3Value `json:"barData"`
}

type SimpleBarChart3Value struct {
	Label                       string `json:"label"`
	HCPercentageConsummationkWH string `json:"HCPercentageConsummationkWH"`
	HPPercentageConsummationkWH string `json:"HPPercentageConsummationkWH"`
}

type SimpleBarChart2Data struct {
	BaseSimpleBarChartData
	BarData []SimpleBarChart2Value `json:"barData"`
}

type SimpleBarChart2Value struct {
	Label             string `json:"label"`
	HCConsummationkWH string `json:"HCConsummationkWH"`
	HPConsummationkWH string `json:"HPConsummationkWH"`
}

type SimpleBarChart5Data struct {
	BaseSimpleBarChartData
	BarData []SimpleBarChart5Value `json:"barData"`
}

type SimpleBarChart5Value struct {
	Label                 string  `json:"label"`
	NombreMoyenDeRecharge float64 `json:"nombreMoyenDeRecharge"`
}

type SimpleBarChart4Data struct {
	BaseSimpleBarChartData
	BarData []SimpleBarChart4Value `json:"barData"`
}

type SimpleBarChart4Value struct {
	Label            string `json:"label"`
	NombreDeRecharge int    `json:"nombreDeRecharge"`
}

type SimpleBarChartCountryCountsData struct {
	BaseSimpleBarChartData
	BarData []SimpleBarChartCountryCountsValue `json:"barData"`
}

type SimpleBarChartCountryCountsValue struct {
	Label       string `json:"label"`
	Occurrences int    `json:"occorrenze"`
}

type SimpleBarChartAlliancesPerGenerationData struct {
	BaseSimpleBarChartData
	BarData []SimpleBarChartAlliancesPerGenerationValue `json:"barData"`
}

type SimpleBarChartAlliancesPerGenerationValue struct {
	Label       string `json:"label"`
	Generation1 int    `json:"1"`
	Generation2 int    `json:"2"`
	Generation3 int    `json:"3"`
	Generation4 int    `json:"4"`
}

type SimpleBarChartInvolvedUniversitiesData struct {
	BaseSimpleBarChartData
	BarData []SimpleBarChartInvolvedUniversitiesValue `json:"barData"`
}

type SimpleBarChartInvolvedUniversitiesValue struct {
	Label                string `json:"label"`
	NumberOfUniversities int    `json:"numeroUniversitaCoinvolte"`
}

type BarColor struct {
	NumberOfPosts               string `json:"numberOfPosts"`
	DureeMoyenneDeRechargeMin   string `json:"dureeMoyenneDeRechargeMin"`
	HCPercentageConsummationkWH string `json:"HCPercentageConsummationkWH"`
	HPPercentageConsummationkWH string `json:"HPPercentageConsummationkWH"`
	HCConsummationkWH           string `json:"HCConsummationkWH"`
	HPConsummationkWH           string `json:"HPConsummationkWH"`
	NombreMoyenDeRecharge       string `json:"nombreMoyenDeRecharge"`
	NombreDeRecharge            string `json:"nombreDeRecharge"`
	Occurrences                 string `json:"occorrenze"`
	Generation1                 string `json:"1"`
	Generation2                 string `json:"2"`
	Generation3                 string `json:"3"`
	Generation4                 string `json:"4"`
	NumberOfUniversities        string `json:"numeroUniversitaCoinvolte"`
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

type BarByLabel []SimpleBarChartAlliancesPerGenerationValue

func (a BarByLabel) Len() int {
	return len(a)
}

func (a BarByLabel) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}

func (a BarByLabel) Less(i, j int) bool {
	labelI, errI := strconv.Atoi(a[i].Label)
	labelJ, errJ := strconv.Atoi(a[j].Label)
	if errI != nil || errJ != nil {
		return a[i].Label < a[j].Label
	}
	return labelI < labelJ
}
