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
	Label         string  `json:"label"`
	NumberOfPosts float64 `json:"numberOfPosts"`
}

type BarColor struct {
	NumberOfPosts string `json:"numberOfPosts"`
}
