package app

import mattermost "github.com/mattermost/mattermost-server/v6/model"

type Channel struct {
	ChannelID      string `json:"channelId"`
	ParentID       string `json:"parentId"`
	SectionID      string `json:"sectionId"`
	OrganizationID string `json:"organizationId"`
}

// Unifies cs-connect channel data with mattermost data we're interested about
type FullChannel struct {
	ChannelID      string `json:"channelId"`
	ParentID       string `json:"parentId"`
	SectionID      string `json:"sectionId"`
	OrganizationID string `json:"organizationId"`
	DeleteAt       int64  `json:"deletedAt"`
}

type ChannelFilterOptions struct {
	Sort       SortField
	Direction  SortDirection
	SearchTerm string

	// Pagination options
	Page    int
	PerPage int
}

type GetChannelsResults struct {
	Items []Channel `json:"items"`
}

type GetMattermostChannelsResults struct {
	Items []mattermost.Channel `json:"items"`
}

type GetChannelByIDResult struct {
	Channel FullChannel `json:"channel"`
}

type AddChannelParams struct {
	UserID              string `json:"userId"`
	ChannelID           string `json:"channelId"`
	ChannelName         string `json:"channelName"`
	CreatePublicChannel bool   `json:"createPublicChannel"`
	ParentID            string `json:"parentId"`
	SectionID           string `json:"sectionId"`
	TeamID              string `json:"teamId"`
	OrganizationID      string `json:"organizationId"`
}

type AddChannelResult struct {
	ChannelID string `json:"channelId"`
	ParentID  string `json:"parentId"`
	SectionID string `json:"sectionId"`
}

type ExportChannelParams struct {
	Format       string   `json:"format"`
	ReferenceIds []string `json:"references"`
}
