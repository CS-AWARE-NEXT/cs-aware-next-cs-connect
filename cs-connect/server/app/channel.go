package app

import mattermost "github.com/mattermost/mattermost-server/v6/model"

type Channel struct {
	ChannelID      string `json:"channelId"`
	ParentID       string `json:"parentId"`
	SectionID      string `json:"sectionId"`
	OrganizationID string `json:"organizationId"`
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
	Channel Channel `json:"channel"`
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
