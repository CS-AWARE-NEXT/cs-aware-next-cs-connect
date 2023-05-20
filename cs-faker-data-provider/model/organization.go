package model

type Organization struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Issue struct {
	ID                        string            `json:"id"`
	Name                      string            `json:"name"`
	ObjectivesAndResearchArea string            `json:"objectives_and_research_area"`
	Outcomes                  []IssueOutcome    `json:"outcomes"`
	Elements                  []IssueElement    `json:"elements"`
	Roles                     []IssueRole       `json:"roles"`
	Attachments               []IssueAttachment `json:"attachments"`
}

type IssueOutcome struct {
	ID      string `json:"id"`
	Outcome string `json:"outcome"`
}

type IssueElement struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	OrganizationID string `json:"organizationId"`
	ParentID       string `json:"parentId"`
}

type IssueRole struct {
	ID string `json:"id"`
	UserID string `json:"userId"`
	Roles []string `json:"roles"`
}

type IssueAttachment struct {
	ID          string `json:"id"`
	Attachment string `json:"attachment"`
}

type Incident struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Policy struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Story struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
