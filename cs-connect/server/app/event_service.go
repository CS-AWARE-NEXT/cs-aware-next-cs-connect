package app

import (
	"fmt"
	"strings"

	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
	"github.com/pkg/errors"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/config"
)

type EventService struct {
	api             plugin.API
	platformService *config.PlatformService
}

// NewEventService returns a new platform config service
func NewEventService(api plugin.API, platformService *config.PlatformService) *EventService {
	return &EventService{
		api:             api,
		platformService: platformService,
	}
}

func (s *EventService) UserAdded(params UserAddedParams) error {
	s.api.LogInfo("Params on user added", "params", params)
	if err := s.setupCategories(s.platformService); err != nil {
		return errors.Wrapf(err, "Could not setup categories")
	}

	channels, err := s.api.GetPublicChannelsForTeam(params.TeamID, 0, 200)
	if err != nil {
		return fmt.Errorf("couldn't get public channels for team %s", params.TeamID)
	}

	for _, channel := range channels {
		if _, err := s.api.AddChannelMember(channel.Id, params.UserID); err != nil {
			return fmt.Errorf("couldn't add channel %s to user %s", channel.Id, params.UserID)
		}

		categories, err := s.api.GetChannelSidebarCategories(params.UserID, params.TeamID)
		if err != nil {
			return fmt.Errorf("couldn't get categories in %s for user %s", channel.Id, params.UserID)
		}
		for _, category := range categories.Categories {
			if strings.Contains(strings.ToLower(category.DisplayName), "channels") {
				config, err := s.platformService.GetPlatformConfig()
				if err != nil {
					return fmt.Errorf("couldn't get config in %s for user %s", channel.Id, params.UserID)
				}
				for i, channelID := range category.Channels {
					if channel.Id == channelID {
						for _, organization := range config.Organizations {
							formattedOrganizationName := strings.ToLower(strings.ReplaceAll(organization.Name, " ", "-"))
							if strings.Contains(strings.ToLower(channel.DisplayName), formattedOrganizationName) {
								category.Channels = append(category.Channels[:i], category.Channels[i+1:]...)
							}
						}
					}
				}
			}
			formattedCategoryName := strings.ToLower(strings.ReplaceAll(category.DisplayName, " ", "-"))
			if strings.Contains(strings.ToLower(channel.DisplayName), formattedCategoryName) {
				contained := false
				for _, channelID := range category.Channels {
					if channel.Id == channelID {
						contained = true
						break
					}
				}
				if contained {
					break
				}
				category.Channels = append(category.Channels, channel.Id)
			}
		}
		if _, err := s.api.UpdateChannelSidebarCategories(params.UserID, params.TeamID, categories.Categories); err != nil {
			return errors.Wrap(err, "could not update categories for team to add channel")
		}
	}

	return nil
}

func (s *EventService) setupCategories(platformService *config.PlatformService) error {
	s.api.LogInfo("Setting up categories")
	config, err := platformService.GetPlatformConfig()
	if err != nil {
		return err
	}
	teams, teamsErr := s.api.GetTeams()
	if teamsErr != nil {
		s.api.LogError(fmt.Sprintf("Could not get teams seting up categories due to %s", teamsErr.Error()))
		return err
	}
	for _, team := range teams {
		users, err := s.api.GetUsersInTeam(team.Id, 0, 200)
		if err != nil {
			s.api.LogError(fmt.Sprintf("Could not get users in setting up categories due to %s", teamsErr.Error()))
			return err
		}
		for _, user := range users {
			categories, err := s.api.GetChannelSidebarCategories(user.Id, team.Id)
			if err != nil {
				s.api.LogError(fmt.Sprintf("Could not get sidebar categories due to %s", teamsErr.Error()))
				return err
			}
			if s.hasEachOrganizationCategory(config, categories) {
				continue
			}
			for _, organization := range config.Organizations {
				if s.hasOrganizationCategory(organization, categories) {
					continue
				}
				category, err := s.buildOrganizationCategory(team.Id, user.Id, organization)
				if err != nil {
					continue
				}
				if _, err := s.api.CreateChannelSidebarCategory(user.Id, team.Id, category); err != nil {
					s.api.LogError(fmt.Sprintf("Could not create sidebar category due to %s", teamsErr.Error()))
					continue
				}
			}
		}
	}
	return nil
}

func (s *EventService) hasEachOrganizationCategory(config *config.PlatformConfig, categories *model.OrderedSidebarCategories) bool {
	organizations := config.Organizations
	matches := 0
	for _, organization := range organizations {
		for _, category := range categories.Categories {
			if strings.Contains(strings.ToLower(category.DisplayName), strings.ToLower(organization.Name)) {
				matches++
				break
			}
		}
	}
	return matches == len(organizations)
}

func (s *EventService) hasOrganizationCategory(organization config.Organization, categories *model.OrderedSidebarCategories) bool {
	for _, category := range categories.Categories {
		if strings.Contains(strings.ToLower(category.DisplayName), strings.ToLower(organization.Name)) {
			return true
		}
	}
	return false
}

func (s *EventService) buildOrganizationCategory(teamID, userID string, organization config.Organization) (*model.SidebarCategoryWithChannels, error) {
	channels, err := s.api.GetChannelsForTeamForUser(teamID, userID, true)
	if err != nil {
		channels = []*model.Channel{}
	}
	organizationChannelIds := []string{}
	for _, channel := range channels {
		formattedOrganizationName := strings.ToLower(strings.ReplaceAll(organization.Name, " ", "-"))
		if strings.Contains(strings.ToLower(channel.DisplayName), formattedOrganizationName) {
			organizationChannelIds = append(organizationChannelIds, channel.Id)
		}
	}

	category := &model.SidebarCategoryWithChannels{
		SidebarCategory: model.SidebarCategory{
			UserId:      userID,
			TeamId:      teamID,
			Type:        model.SidebarCategoryChannels,
			DisplayName: organization.Name,
		},
		Channels: organizationChannelIds,
	}
	return category, nil
}
