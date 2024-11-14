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
	OrderBy        string   `json:"order_by"`
	Direction      string   `json:"direction"`
	SourceType     string   `json:"sourceType"`
}

type DatalakeNewsPostBody struct {
	Keywords []string `json:"keywords"`
}

type NewsEntity struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	Search         string `json:"search"`
	OrganizationId string `json:"organizationId"`
	ParentId       string `json:"parentId"`
}

type NewsPostsV2 struct {
	PageInfo PageInfoV2 `json:"pageInfo"`
	Entries  []EntryV2  `json:"entries"`
}

type PageInfoV2 struct {
	Offset     int    `json:"offset"`
	Count      int    `json:"count"`
	TotalCount int    `json:"totalCount"`
	OrderBy    string `json:"orderBy"`
	Direction  string `json:"direction"`
}

type EntryV2 struct {
	PostID                string `json:"post_id"`
	Title                 string `json:"title"`
	Body                  string `json:"body"`
	Language              string `json:"language"`
	SourceType            string `json:"sourcetype"`
	ObservationCreated    string `json:"observation_created"`
	ObservationUploaded   string `json:"observation_uploaded"`
	ExternalAccountID     string `json:"external_account_id"`
	AccountName           string `json:"account_name"`
	AccountDisplayName    string `json:"account_displayname"`
	AccountDescription    string `json:"account_description"`
	AccountSourceType     string `json:"account_sourcetype"`
	AccountCollectorState string `json:"account_collectorstate"`
	AccountLastCollected  string `json:"account_lastcollected"`
	Translations          string `json:"translations"`
}
