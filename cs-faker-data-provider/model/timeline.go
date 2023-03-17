package model

type TimelineData struct {
	Items []TimelineItem `json:"items"`
}

type TimelineItem struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Text  string `json:"text"`
}
