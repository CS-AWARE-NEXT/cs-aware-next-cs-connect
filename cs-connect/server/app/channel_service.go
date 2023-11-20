package app

import (
	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-server/v6/plugin"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/config"
)

type ChannelService struct {
	api                    plugin.API
	store                  ChannelStore
	mattermostChannelStore MattermostChannelStore
	categoryService        *CategoryService
	platformService        *config.PlatformService
}

// NewChannelService returns a new channels service
func NewChannelService(api plugin.API, store ChannelStore, mattermostChannelStore MattermostChannelStore, categoryService *CategoryService, platformService *config.PlatformService) *ChannelService {
	return &ChannelService{
		api:                    api,
		store:                  store,
		mattermostChannelStore: mattermostChannelStore,
		categoryService:        categoryService,
		platformService:        platformService,
	}
}

func (s *ChannelService) GetChannels(sectionID string, parentID string) (GetChannelsResults, error) {
	s.api.LogInfo("Getting channels", "sectionId", sectionID, "parentId", parentID)
	return s.store.GetChannels(sectionID, parentID)
}

func (s *ChannelService) GetAllOrganizationChannels() (GetChannelsResults, error) {
	s.api.LogInfo("Getting all channels")
	return s.store.GetAllChannels()
}

func (s *ChannelService) GetChannelsForTeam(teamID string) (GetMattermostChannelsResults, error) {
	return s.mattermostChannelStore.GetChannelsForTeam(teamID)
}

func (s *ChannelService) GetChannelsByOrganizationID(organizationID string) (GetChannelsResults, error) {
	s.api.LogInfo("Getting channels", "organizationID", organizationID)
	return s.store.GetChannelsByOrganizationID(organizationID)
}

func (s *ChannelService) GetChannelByID(channelID string) (GetChannelByIDResult, error) {
	s.api.LogInfo("Getting channel", "channelId", channelID)
	return s.store.GetChannelByID(channelID)
}

func (s *ChannelService) AddChannel(sectionID string, params AddChannelParams) (AddChannelResult, error) {
	s.api.LogInfo("Adding channel", "sectionId", sectionID, "params", params)
	addChannelResult, err := s.store.AddChannel(sectionID, params)
	if err != nil {
		return addChannelResult, err
	}

	config, configErr := s.platformService.GetPlatformConfig()
	ecosystem, ecosystemFound := config.GetEcosystem()

	if configErr != nil || !ecosystemFound {
		s.api.LogWarn("Failed to check whether the channel should be added to the ecosystem sidebar category")
		return addChannelResult, err
	}
	if params.OrganizationID != ecosystem.ID {
		s.api.LogWarn("the provided channel isn't linked to an ecosystem, skipping category update")
		return addChannelResult, err
	}

	if catErr := s.categoryService.addChannelToEcosystemCategory(params.UserID, params.TeamID, addChannelResult.ChannelID); catErr != nil {
		return addChannelResult, errors.Wrap(catErr, "couldn't add channel to ecosystem category")
	}
	return addChannelResult, err
}
