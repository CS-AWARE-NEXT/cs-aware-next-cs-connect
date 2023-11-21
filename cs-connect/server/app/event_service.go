package app

import (
	"encoding/base64"
	"fmt"

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
	configuration   *config.MattermostConfig
}

// NewEventService returns a new platform config service
func NewEventService(api plugin.API, platformService *config.PlatformService, channelService *ChannelService, categoryService *CategoryService, botID string, configuration *config.MattermostConfig) *EventService {
	return &EventService{
		api:             api,
		platformService: platformService,
		channelService:  channelService,
		categoryService: categoryService,
		botID:           botID,
		configuration:   configuration,
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

	allOrgChannels, xerr := s.channelService.GetAllOrganizationChannels()
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

	if params.OrgID == config.OrganizationIDAll {
		if params.Password == "" || base64.StdEncoding.EncodeToString([]byte(params.Password)) != s.configuration.GetConfiguration().AdminPassword {
			return fmt.Errorf("used an incorrect password while allowing all organizations to be shown to user %s", params.UserID)
		}
	}

	platformConfig, configErr := s.platformService.GetPlatformConfig()
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

	allOrgChannels, xerr := s.channelService.GetAllOrganizationChannels()
	if xerr != nil {
		return fmt.Errorf("couldn't get all organization channels")
	}

	ecosystem, ecosystemFound := platformConfig.GetEcosystem()
	if !ecosystemFound {
		return fmt.Errorf("couldn't get ecosystem")
	}

	for _, channel := range channels.Items {
		for _, orgChannel := range allOrgChannels.Items {
			if channel.Id == orgChannel.ChannelID {
				if orgChannel.OrganizationID == ecosystem.ID {
					continue
				}

				if params.OrgID == config.OrganizationIDAll || orgChannel.OrganizationID == params.OrgID {
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
