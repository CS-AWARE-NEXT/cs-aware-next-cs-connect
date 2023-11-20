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
	channelService  *ChannelService
	categoryService *CategoryService
	botID           string
}

// NewEventService returns a new platform config service
func NewEventService(api plugin.API, platformService *config.PlatformService, channelService *ChannelService, categoryService *CategoryService, botID string) *EventService {
	return &EventService{
		api:             api,
		platformService: platformService,
		channelService:  channelService,
		categoryService: categoryService,
		botID:           botID,
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

	if err := s.categoryService.cleanCategories(categories, params.TeamID, params.UserID); err != nil {
		return errors.Wrap(err, "could not clean categories for team to add channel")
	}

	publicChannels, err := s.api.GetPublicChannelsForTeam(params.TeamID, 0, 200)
	if err != nil {
		return fmt.Errorf("couldn't get public channels for team %s", params.TeamID)
	}

	allChannels, xerr := s.channelService.GetChannelsForTeam(params.TeamID)
	if xerr != nil {
		return fmt.Errorf("couldn't get all channels for team %s", params.TeamID)
	}

	allOrgChannels, xerr := s.channelService.GetAllChannels()
	if xerr != nil {
		return fmt.Errorf("couldn't get all organization channels")
	}

	// Ensure the bot user is present in all channels
	if _, err := s.api.CreateTeamMember(params.TeamID, s.botID); err != nil {
		s.api.LogWarn("failed to add bot to team", "team", params.TeamID, "err", err)
	} else {
		for _, channel := range allChannels.Items {
			if _, err := s.api.AddChannelMember(channel.Id, s.botID); err != nil {
				s.api.LogWarn("couldn't add channel to bot", "channel", channel.Id, "bot", s.botID, "err", err)
			}
		}
	}

	config, configErr := s.platformService.GetPlatformConfig()
	if configErr != nil {
		return fmt.Errorf("couldn't get config")
	}
	ecosystem, ecosystemFound := config.GetEcosystem()
	if !ecosystemFound {
		return fmt.Errorf("couldn't get ecosystem")
	}

	// Automatically join public channels (ecosystem and default ones, NOT organization ones)
	for _, channel := range publicChannels {
		if channel.Type != model.ChannelTypeOpen {
			continue
		}

		ignoreChannel := false
		for _, orgChannel := range allOrgChannels.Items {
			if channel.Id == orgChannel.ChannelID && orgChannel.OrganizationID != ecosystem.ID {
				ignoreChannel = true
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

	config, configErr := s.platformService.GetPlatformConfig()
	if configErr != nil {
		return fmt.Errorf("couldn't get config for user %s", params.UserID)
	}

	user, userErr := s.api.GetUser(params.UserID)
	if userErr != nil {
		return errors.Wrap(userErr, "could not fetch user to set orgID prop")
	}
	if _, found := user.GetProp("orgId"); found {
		return fmt.Errorf("couldn't set organization for user %s: the user already has an organization seleted", params.UserID)
	}

	// Custom getter to properly fetch private channels for the team as well
	channels, getChannelsErr := s.channelService.GetChannelsForTeam(params.TeamID)
	if getChannelsErr != nil {
		return fmt.Errorf("couldn't get all channels of team %s", params.TeamID)
	}

	allOrgChannels, xerr := s.channelService.GetAllChannels()
	if xerr != nil {
		return fmt.Errorf("couldn't get all organization channels")
	}

	ecosystem, ecosystemFound := config.GetEcosystem()
	if !ecosystemFound {
		return fmt.Errorf("couldn't get ecosystem")
	}

	for _, channel := range channels.Items {
		for _, orgChannel := range allOrgChannels.Items {
			if channel.Id == orgChannel.ChannelID {
				if orgChannel.OrganizationID == ecosystem.ID {
					continue
				}

				if orgChannel.OrganizationID == params.OrgID {
					_, _ = s.api.AddChannelMember(channel.Id, params.UserID)
				} else {
					_ = s.api.DeleteChannelMember(channel.Id, params.UserID)
				}
			}
		}
	}

	user.SetProp("orgId", params.OrgID)
	if _, err := s.api.UpdateUser(user); err != nil {
		return fmt.Errorf("couldn't update user props")
	}

	// Also needed to actually refresh the channel order in the left sidebar, or else it'll happen when the user switches the channel the first time after setting the org
	categories, err := s.api.GetChannelSidebarCategories(params.UserID, params.TeamID)
	if err != nil {
		return fmt.Errorf("couldn't get categories for user %s", params.UserID)
	}

	if err := s.categoryService.cleanCategories(categories, params.TeamID, params.UserID); err != nil {
		return errors.Wrap(err, "could not update categories for team to add channel")
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

// Currently unused
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
				category, err := s.categoryService.buildOrganizationCategory(team.Id, user.Id, organization)
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

// Currently unused
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

// Currently unused
func (s *EventService) hasOrganizationCategory(organization config.Organization, categories *model.OrderedSidebarCategories) bool {
	for _, category := range categories.Categories {
		if strings.Contains(strings.ToLower(category.DisplayName), strings.ToLower(organization.Name)) {
			return true
		}
	}
	return false
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
