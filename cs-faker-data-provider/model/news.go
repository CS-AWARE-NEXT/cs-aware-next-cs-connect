package model

import "time"

type NewsPosts struct {
	PageInfo PageInfo `json:"pageInfo"`
	Entries  []Entry  `json:"entries"`
}

type PageInfo struct {
	Offset     int `json:"offset"`
	Count      int `json:"count"`
	TotalCount int `json:"totalCount"`
}

type Entry struct {
	ID                string         `json:"id"`
	Source            Source         `json:"source"`
	OriginalText      OriginalText   `json:"originalText"`
	TranslatedText    TranslatedText `json:"translatedText"`
	ModifiedTimestamp time.Time      `json:"modifiedTimestamp"`
	KeywordsMatched   []string       `json:"keywordsMatched"`
}

type Source struct {
	Type        string `json:"type"`
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type OriginalText struct {
	Language string `json:"language"`
	Title    string `json:"title"`
	Body     string `json:"body"`
}

type TranslatedText struct {
	Language string `json:"language"`
	Body     string `json:"body"`
}

type NewsPostBody struct {
	InstanceID     string   `json:"instanceId"`
	Keywords       []string `json:"keywords"`
	TargetLanguage string   `json:"targetLanguage"`
	Offset         int      `json:"offset"`
	Limit          int      `json:"limit"`
	NewerThan      string   `json:"newerThan"`
}
