package app

type UserAddedParams struct {
	TeamID string `json:"teamId"`
	UserID string `json:"userId"`
}

type SetOrganizationParams struct {
	TeamID   string `json:"teamId"`
	UserID   string `json:"userId"`
	OrgID    string `json:"orgId"`
	Password string `json:"password"`
}

type GetUserPropsParams struct {
	UserID string `json:"userId"`
}

type ArchiveIssueChannelsParams struct {
	IssueID string `json:"issueId"`
}
