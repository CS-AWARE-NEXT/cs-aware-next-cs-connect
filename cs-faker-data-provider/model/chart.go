package model

type SimpleLineChartData struct {
	LineData       []SimpleLineChartValue `json:"lineData"`
	LineColor      LineColor              `json:"lineColor"`
	ReferenceLines []ReferenceLine        `json:"referenceLines"`
}

type SimpleLineChartValue struct {
	Label         string  `json:"label"`
	NumberOfPosts float64 `json:"numberOfPosts"`
}

type LineColor struct {
	NumberOfPosts string `json:"numberOfPosts"`
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
	Label                     string  `json:"label"`
	NumberOfPosts             float64 `json:"numberOfPosts"`
	DureeMoyenneDeRechargeMin string  `json:"dureeMoyenneDeRechargeMin"`
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
	HCPercentageConsummationkWH string `json:"hcPercentageConsummationkWH"`
	HPPercentageConsummationkWH string `json:"hpPercentageConsummationkWH"`
}

type SimpleBarChart2Data struct {
	BarData  []SimpleBarChart2Value `json:"barData"`
	BarColor BarColor               `json:"barColor"`
}

type SimpleBarChart2Value struct {
	Label             string `json:"label"`
	HCConsummationkWH string `json:"hcConsummationkWH"`
	HPConsummationkWH string `json:"hpConsummationkWH"`
}

type BarColor struct {
	NumberOfPosts               string `json:"numberOfPosts"`
	DureeMoyenneDeRechargeMin   string `json:"dureeMoyenneDeRechargeMin"`
	HCPercentageConsummationkWH string `json:"hcPercentageConsummationkWH"`
	HPPercentageConsummationkWH string `json:"hpPercentageConsummationkWH"`
	HCConsummationkWH           string `json:"hcConsummationkWH"`
	HPConsummationkWH           string `json:"hpConsummationkWH"`
}
