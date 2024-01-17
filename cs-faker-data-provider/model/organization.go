package model

type Organization struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Issue struct {
	ID                        string            `json:"id"`
	Name                      string            `json:"name"`
	ObjectivesAndResearchArea string            `json:"objectivesAndResearchArea"`
	Outcomes                  []IssueOutcome    `json:"outcomes"`
	Elements                  []IssueElement    `json:"elements"`
	Roles                     []IssueRole       `json:"roles"`
	Attachments               []IssueAttachment `json:"attachments"`
	DeleteAt                  int64             `json:"deleteat"` // Follows the same rule of Mattermost DeleteAt columns (Unix milliseconds timestamp, 0 is used to signal the record is NOT deleted)
}

type IssueOutcome struct {
	ID      string `json:"id"`
	Outcome string `json:"outcome"`
	IssueID string `json:"-"`
}

type IssueElement struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	OrganizationID string `json:"organizationId"`
	ParentID       string `json:"parentId"`
	IssueID        string `json:"-"`
}

type IssueRole struct {
	ID      string   `json:"id"`
	UserID  string   `json:"userId"`
	Roles   []string `json:"roles"`
	IssueID string   `json:"-"`
}

type IssueAttachment struct {
	ID         string `json:"id"`
	Attachment string `json:"attachment"`
	IssueID    string `json:"-"`
}

type IssueRoleEntity struct {
	ID      string `json:"id"`
	UserID  string `json:"userId"`
	Roles   string `json:"roles"`
	IssueID string `json:"-"`
}

type Incident struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// TODO: refactor with composition
type ExtendedIncident struct {
	State         string `json:"state"`
	ClosedAt      string `json:"closedAt"`
	FirstObserved string `json:"firstObserved"`
	ID            string `json:"id"`
	Type          string `json:"type"`
	Group         string `json:"group"`
	AssignedTo    string `json:"assignedTo"`
	Where         string `json:"where"`
	Name          string `json:"name"`
	Description   string `json:"description"`
}

type IncidentWithOrganizationId struct {
	Incident
	OrganizationId string `json:"organizationId"`
}

type Policy struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	OrganizationId string `json:"organizationId"`
}

type Story struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type SocialMedia struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type News struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Exercise struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
