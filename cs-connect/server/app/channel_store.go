package app

// ChannelStore is an interface for storing channels
type ChannelStore interface {
	// GetChannels retrieves all channels for a section
	GetChannels(sectionID string, parentID string) (GetChannelsResults, error)

	// GetAllChannels retrieves all channels
	GetAllChannels() (GetChannelsResults, error)

	// GetChannelByOrganizationID retrieves all the organization channels given the organization id
	GetChannelsByOrganizationID(organizationlID string) (GetChannelsResults, error)

	// GetChannelByID retrieves a channel given the channel id
	GetChannelByID(channelID string) (GetChannelByIDResult, error)

	// AddChannel adds a channel to a section
	AddChannel(sectionID string, params AddChannelParams) (AddChannelResult, error)

	LinkChannelToOrganization(channelID, organizationID string) error
}
