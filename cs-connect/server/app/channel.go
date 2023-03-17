package app

type Channel struct {
	ChannelID string `json:"channelId"`
	ParentID  string `json:"parentId"`
	SectionID string `json:"sectionId"`
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

type GetChannelByIDResult struct {
	Channel Channel `json:"channel"`
}

type AddChannelParams struct {
	ChannelID           string `json:"channelId"`
	ChannelName         string `json:"channelName"`
	CreatePublicChannel bool   `json:"createPublicChannel"`
	ParentID            string `json:"parentId"`
	SectionID           string `json:"sectionId"`
	TeamID              string `json:"teamId"`
}

type AddChannelResult struct {
	ChannelID string `json:"channelId"`
	ParentID  string `json:"parentId"`
	SectionID string `json:"sectionId"`
}
