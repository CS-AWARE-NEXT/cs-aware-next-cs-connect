package model

type ListData struct {
	Items []ListItem `json:"items"`
}

type ListItem struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}
