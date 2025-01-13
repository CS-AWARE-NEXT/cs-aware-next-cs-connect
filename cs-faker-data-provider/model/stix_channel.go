package model

type STIXChannel struct {
	ID                 string            `json:"id"`
	SpecVersion        string            `json:"spec_version"`
	Type               string            `json:"type"`
	Created            string            `json:"created"`
	Modified           string            `json:"modified"`
	Name               string            `json:"name"`
	Description        string            `json:"description"`
	ChannelURL         string            `json:"channel_url"`
	Published          string            `json:"published"`
	ObjectRefs         []*STIXPost       `json:"object_refs"`
	ExternalReferences []ExportReference `json:"external_references"`
}

type STIXPost struct {
	ID                 string      `json:"id"`
	SpecVersion        string      `json:"spec_version"`
	Type               string      `json:"type"`
	Created            string      `json:"created"`
	Modified           string      `json:"modified"`
	Authors            []string    `json:"authors"`
	Opinion            string      `json:"opinion"`
	Labels             []string    `json:"labels"`
	ExternalReferences []string    `json:"external_references"` // Used for file attachments
	ObjectRefs         []*STIXPost `json:"object_refs"`
}

type ExportReference struct {
	SourceName  string   `json:"source_name"`
	ExternalIds []string `json:"external_ids"`
	URLs        []string `json:"urls"`
}
