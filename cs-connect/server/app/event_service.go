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
	api                    plugin.API
	store                  CategoryStore
	mattermostChannelStore MattermostChannelStore
	platformService        *config.PlatformService
}

// NewEventService returns a new platform config service
func NewEventService(api plugin.API, store CategoryStore, mattermostChannelStore MattermostChannelStore, platformService *config.PlatformService) *EventService {
	return &EventService{
		api:                    api,
		store:                  store,
		mattermostChannelStore: mattermostChannelStore,
		platformService:        platformService,
	}
}

// Properly set up categories (ecosystem + generic channels category) and automatically join public non-org channels.
func (s *EventService) UserAdded(params UserAddedParams) error {
	s.api.LogInfo("Params on user added", "params", params)

	if params.UserID == "" || params.TeamID == "" {
		return fmt.Errorf("missing params data")
	}

	categories, err := s.api.GetChannelSidebarCategories(params.UserID, params.TeamID)
	if err != nil {
		return fmt.Errorf("couldn't get categories for user %s", params.UserID)
	}

	if err := s.cleanCategories(categories, params.TeamID, params.UserID); err != nil {
		return errors.Wrap(err, "could not clean categories for team to add channel")
	}

	channels, err := s.api.GetPublicChannelsForTeam(params.TeamID, 0, 200)
	if err != nil {
		return fmt.Errorf("couldn't get public channels for team %s", params.TeamID)
	}

	config, configErr := s.platformService.GetPlatformConfig()
	if configErr != nil {
		return fmt.Errorf("couldn't get config")
	}

	// Automatically join public channels (ecosystem and default ones, NOT organization ones)
	for _, channel := range channels {
		if channel.Type != model.ChannelTypeOpen {
			continue
		}

		ignoreChannel := false
		for _, organization := range config.Organizations {
			if organization.IsEcosystem {
				continue
			}
			formattedOrganizationName := strings.ToLower(strings.ReplaceAll(organization.Name, " ", "-"))
			if strings.Contains(strings.ToLower(channel.DisplayName), formattedOrganizationName) {
				// Public organization channel, ignore
				ignoreChannel = true
				break
			}
		}
		if ignoreChannel {
			continue
		}

		if _, err := s.api.AddChannelMember(channel.Id, params.UserID); err != nil {
			return fmt.Errorf("couldn't add channel %s to user %s", channel.Id, params.UserID)
		}
	}

	return nil
}

// Set the organization the user will be related to. This will automatically join and leave the organization channels based on the org ID passed.
func (s *EventService) SetOrganizations(params SetOrganizationParams) error {
	s.api.LogInfo("Params on setOrganization", "params", params)

	categories, err := s.api.GetChannelSidebarCategories(params.UserID, params.TeamID)
	if err != nil {
		return fmt.Errorf("couldn't get categories for user %s", params.UserID)
	}

	if err := s.cleanCategories(categories, params.TeamID, params.UserID); err != nil {
		return errors.Wrap(err, "could not update categories for team to add channel")
	}

	config, configErr := s.platformService.GetPlatformConfig()
	if configErr != nil {
		return fmt.Errorf("couldn't get config for user %s", params.UserID)
	}

	// Custom getter to properly fetch private channels for the team as well
	channels, getChannelsErr := s.mattermostChannelStore.GetChannelsForTeam(params.TeamID)
	if getChannelsErr != nil {
		return fmt.Errorf("couldn't get all channels of team %s", params.TeamID)
	}

	// TODO what was team_name for
	team, _ := s.api.GetTeam(params.TeamID)
	// Send the info of the default channel back to the user to properly handle redirecting in case the current opened channel is related to the previous organization
	defaultChannel, _ := s.api.GetChannelByName(params.TeamID, "town-square", false)
	var orgName string

	for _, channel := range channels {
		for _, organization := range config.Organizations {
			if organization.IsEcosystem {
				continue
			}
			formattedOrganizationName := strings.ToLower(strings.ReplaceAll(organization.Name, " ", "-"))
			// Currently channels are associated to organizations by the name. This should be improved with an explicit link (for example by reusing the CSA_channels table)
			if strings.Contains(strings.ToLower(channel.DisplayName), formattedOrganizationName) {
				// This is an organization channel, automatically join or exit it based on the organization selected by the user
				if organization.ID == params.OrgID {
					_, err = s.api.AddChannelMember(channel.Id, params.UserID)
					orgName = organization.Name
				} else {
					// Private channels cannot be left if the user's the last member with the normal API
					_ = s.mattermostChannelStore.ForceMemberLeave(channel.Id, params.UserID)

					// Broadcast an event to allow the user to refresh his channel list
					f := model.WebsocketBroadcast{TeamId: params.TeamID}
					var data = make(map[string]any)
					data["channel_id"] = channel.Id
					data["user_id"] = params.UserID
					data["team_id"] = params.TeamID
					data["team_name"] = team.Name
					data["default_channel_id"] = defaultChannel.Id
					data["default_channel_name"] = defaultChannel.Name
					s.api.PublishWebSocketEvent("refresh_channels", data, &f)
				}
			}
		}
	}

	user, userErr := s.api.GetUser(params.UserID)
	if userErr != nil {
		return errors.Wrap(err, "could not fetch user to set orgID prop")
	}
	user.SetProp("orgId", params.OrgID)
	user.SetProp("orgName", orgName) // TODO remove when a better channel<->org link exists
	if _, err := s.api.UpdateUser(user); err != nil {
		return fmt.Errorf("couldn't update user props")
	}

	return nil
}

// cleanCategories deletes all the existing categories except the default one, which will contain all the channels previously in the deleted categories.
func (s *EventService) cleanCategories(categories *model.OrderedSidebarCategories, teamID, userID string) error {
	var categoriesToRemove []*model.SidebarCategoryWithChannels
	var ecosystemCategory *model.SidebarCategoryWithChannels
	var ecosystemOrganization config.Organization
	config, err := s.platformService.GetPlatformConfig()

	if err != nil {
		return err
	}

	for _, category := range categories.Categories {
		// TODO use custom SidebarCategoryType?
		if category.DisplayName == "Ecosystem" {
			ecosystemCategory = category
			break
		}
	}

	for _, organization := range config.Organizations {
		if organization.IsEcosystem {
			ecosystemOrganization = organization
			break
		}
	}

	formattedOrganizationName := strings.ToLower(strings.ReplaceAll(ecosystemOrganization.Name, " ", "-"))
	// Create if absent
	if ecosystemCategory == nil {
		ecosystemCategory, _ = s.buildOrganizationCategory(teamID, userID, ecosystemOrganization)

		if _, catErr := s.api.CreateChannelSidebarCategory(userID, teamID, ecosystemCategory); catErr != nil {
			return errors.Wrap(err, "Could not create sidebar category")
		}
	}

	for _, category := range categories.Categories {
		if category.Type == model.SidebarCategoryChannels {
			channels, err := s.api.GetChannelsForTeamForUser(teamID, userID, true)
			if err != nil {
				continue
			}

			var channelIds []string
			for _, channel := range channels {
				// Get the channel data from the ID without passing by the API
				found := false
				for _, categoryChannelID := range category.Channels {
					if categoryChannelID == channel.Id {
						found = true
						break
					}
				}
				if found {
					// filter out the ecosystem channels from the default category
					if strings.Contains(strings.ToLower(channel.DisplayName), formattedOrganizationName) {
						ecosystemCategory.Channels = append(ecosystemCategory.Channels, channel.Id)
					} else {
						channelIds = append(channelIds, channel.Id)
					}
				}
			}
			category.Channels = channelIds
			continue
		}

		// Ignore mattermost system categories
		if category.Type != model.SidebarCategoryCustom {
			continue
		}

		if category.Id == ecosystemCategory.Id {
			continue
		}

		category.Channels = []string{}
		categoriesToRemove = append(categoriesToRemove, category)
	}

	if _, err := s.api.UpdateChannelSidebarCategories(userID, teamID, categories.Categories); err != nil {
		return errors.Wrap(err, "could not update categories for team")
	}

	if err := s.store.DeleteCategories(categoriesToRemove); err != nil {
		return errors.Wrap(err, "could not delete leftover categories")
	}

	return nil
}

func (s *EventService) GetUserProps(params GetUserPropsParams) (model.StringMap, error) {
	user, err := s.api.GetUser(params.UserID)
	if err != nil {
		return nil, fmt.Errorf("could not fetch user %s to get props", params.UserID)
	}
	return user.Props, nil
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

// Setup one category per organization, where the org's channels will reside.
// The channel's name is used to figure out which organization it is related to (org name as substring of the channel name).
// Currently not used
func (s *EventService) setupOrganizationCategories(channels []*model.Channel, userID, teamID string) error {
	if err := s.setupCategories(s.platformService); err != nil {
		return errors.Wrapf(err, "Could not setup categories")
	}

	for _, channel := range channels {
		if _, err := s.api.AddChannelMember(channel.Id, userID); err != nil {
			return fmt.Errorf("couldn't add channel %s to user %s", channel.Id, userID)
		}

		categories, err := s.api.GetChannelSidebarCategories(userID, teamID)
		if err != nil {
			return fmt.Errorf("couldn't get categories in %s for user %s", channel.Id, userID)
		}
		for _, category := range categories.Categories {
			if strings.Contains(strings.ToLower(category.DisplayName), "channels") {
				config, err := s.platformService.GetPlatformConfig()
				if err != nil {
					return fmt.Errorf("couldn't get config in %s for user %s", channel.Id, userID)
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
		if _, err := s.api.UpdateChannelSidebarCategories(userID, teamID, categories.Categories); err != nil {
			return errors.Wrap(err, "could not update categories for team to add channel")
		}
	}

	return nil
}
