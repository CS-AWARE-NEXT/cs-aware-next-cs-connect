package model

type SimpleLineChartData struct {
	LineData  []SimpleLineChartValue `json:"lineData"`
	LineColor LineColor              `json:"lineColor"`
}

type SimpleLineChartValue struct {
	Label         string  `json:"label"`
	NumberOfPosts float64 `json:"numberOfPosts"`
}

type LineColor struct {
	NumberOfPosts string `json:"numberOfPosts"`
}
