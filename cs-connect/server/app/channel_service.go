package app

import "github.com/mattermost/mattermost-server/v6/plugin"

type ChannelService struct {
	api   plugin.API
	store ChannelStore
}

// NewChannelService returns a new channels service
func NewChannelService(api plugin.API, store ChannelStore) *ChannelService {
	return &ChannelService{
		api:   api,
		store: store,
	}
}

func (s *ChannelService) GetChannels(sectionID string, parentID string) (GetChannelsResults, error) {
	s.api.LogInfo("Getting channels", "sectionId", sectionID, "parentId", parentID)
	return s.store.GetChannels(sectionID, parentID)
}

func (s *ChannelService) GetChannelByID(channelID string) (GetChannelByIDResult, error) {
	s.api.LogInfo("Getting channel", "channelId", channelID)
	return s.store.GetChannelByID(channelID)
}

func (s *ChannelService) AddChannel(sectionID string, params AddChannelParams) (AddChannelResult, error) {
	s.api.LogInfo("Adding channel", "sectionId", sectionID, "params", params)
	return s.store.AddChannel(sectionID, params)
}
