package app

import (
	"fmt"

	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
	"github.com/pkg/errors"

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
	channel, err := s.store.GetChannelByID(channelID)
	if err != nil {
		return GetChannelByIDResult{}, err
	}
	mattermostChannel, getErr := s.api.GetChannel(channelID)
	if getErr != nil {
		return GetChannelByIDResult{}, err
	}

	return GetChannelByIDResult{
		Channel: FullChannel{
			ChannelID:      channel.ChannelID,
			ParentID:       channel.ParentID,
			SectionID:      channel.SectionID,
			OrganizationID: channel.OrganizationID,
			DeleteAt:       mattermostChannel.DeleteAt,
		},
	}, nil
}

func (s *ChannelService) GetChannelsBySectionID(sectionID string) (GetChannelsResults, error) {
	s.api.LogInfo("Getting channels", "sectionID", sectionID)
	return s.store.GetChannelsBySectionID(sectionID)
}

func (s *ChannelService) AddChannel(sectionID string, params AddChannelParams) (AddChannelResult, error) {
	s.api.LogInfo("Adding channel", "sectionId", sectionID, "params", params)
	addChannelResult, err := s.store.AddChannel(sectionID, params)
	if err != nil {
		return addChannelResult, err
	}

	if catErr := s.categoryService.addChannelToCategoryByOrganizationID(params.UserID, params.TeamID, addChannelResult.ChannelID, params.OrganizationID); catErr != nil {
		s.api.LogWarn("couldn't add channel to organization category", "channelID", addChannelResult.ChannelID, "orgID", params.OrganizationID)
	}
	return addChannelResult, nil
}

func (s *ChannelService) ArchiveChannels(params ArchiveChannelsParams) error {
	channels, err := s.GetChannelsBySectionID(params.SectionID)
	if err != nil {
		return fmt.Errorf("could not fetch channels for section %s", params.SectionID)
	}

	for _, channel := range channels.Items {
		if deleteErr := s.api.DeleteChannel(channel.ChannelID); deleteErr != nil {
			s.api.LogWarn("Failed to delete channel", "channelID", channel)
		}
	}
	return nil
}

func (s *ChannelService) ExportChannel(channelID string, params ExportChannelParams) (*STIXChannel, error) {
	s.api.LogInfo("Exporting channel", "channelID", channelID)
	channel, err := s.api.GetChannel(channelID)
	if err != nil {
		return nil, errors.Wrap(err, "unable to call GetChannel during channel export")
	}

	var STIXPosts []*STIXPost
	page := 0
	perPage := 1000

	for {
		postList, err := s.api.GetPostsForChannel(channelID, page, perPage)
		if err != nil {
			return nil, errors.Wrap(err, "unable to call GetPostsForChannel during channel export")
		}

		if postList.ToSlice() == nil {
			break
		}

		STIXPostsPerPage := make([]*STIXPost, 0, len(postList.Order))
		usersCache := make(map[string]*model.User)

		for _, key := range postList.Order {
			post := postList.Posts[key]

			// ignore original text for edited messages
			if post.OriginalId != "" {
				continue
			}

			// Ignore thread messages - we'll get them once we find the root message
			if post.RootId != "" {
				continue
			}

			STIXPostsPerPage = append(STIXPostsPerPage, ToStixPost(s.api, post, true, usersCache))
		}

		STIXPosts = append(STIXPosts, STIXPostsPerPage...)
		page++
	}

	return ToStixChannel(channel, STIXPosts, params.References), nil
}
