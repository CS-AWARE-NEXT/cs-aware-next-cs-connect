package model

type SimpleLineChartData struct {
	LineData  []SimpleLineChartValue `json:"lineData"`
	LineColor LineColor              `json:"lineColor"`
}

type SimpleLineChartValue struct {
	Label string  `json:"label"`
	St    float64 `json:"st"`
}

type LineColor struct {
	St string `json:"st"`
}
