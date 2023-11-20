package app

import (
	"fmt"
	"strings"

	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
	"github.com/pkg/errors"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/config"
)

type CategoryService struct {
	api                    plugin.API
	platformService        *config.PlatformService
	channelStore           ChannelStore
	categoryStore          CategoryStore
	mattermostChannelStore MattermostChannelStore
}

// NewCategoryService returns a new channels service
func NewCategoryService(api plugin.API, platformService *config.PlatformService, channelStore ChannelStore, categoryStore CategoryStore, mattermostChannelStore MattermostChannelStore) *CategoryService {
	return &CategoryService{
		api:                    api,
		platformService:        platformService,
		channelStore:           channelStore,
		categoryStore:          categoryStore,
		mattermostChannelStore: mattermostChannelStore,
	}
}

// cleanCategories deletes all the existing categories except the default one, which will contain all the channels previously in the deleted categories.
func (s *CategoryService) cleanCategories(categories *model.OrderedSidebarCategories, teamID, userID string) error {
	var categoriesToRemove []*model.SidebarCategoryWithChannels
	var ecosystemCategory *model.SidebarCategoryWithChannels

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

	ecosystem, ecosystemFound := config.GetEcosystem()
	if !ecosystemFound {
		return fmt.Errorf("couldn't get ecosystem")
	}

	allOrganizationsChannels, xerr := s.channelStore.GetAllChannels()
	if xerr != nil {
		return fmt.Errorf("couldn't get all organizations channels: %s", xerr.Error())
	}

	allChannels, allChannelsErr := s.mattermostChannelStore.GetChannelsForTeam(teamID)
	if allChannelsErr != nil {
		return fmt.Errorf("couldn't get all channels of team %s", teamID)
	}

	// Create if absent
	if ecosystemCategory == nil {
		ecosystemCategory, _ = s.buildOrganizationCategory(teamID, userID, *ecosystem)

		if _, catErr := s.api.CreateChannelSidebarCategory(userID, teamID, ecosystemCategory); catErr != nil {
			return errors.Wrap(err, "Could not create sidebar category")
		}
	}

	for _, category := range categories.Categories {
		if category.Type == model.SidebarCategoryChannels {
			var channelIds []string
			for _, categoryChannelID := range category.Channels {
				for _, orgChannel := range allOrganizationsChannels.Items {
					if orgChannel.ChannelID == categoryChannelID {
						if orgChannel.OrganizationID == ecosystem.ID {
							ecosystemCategory.Channels = append(ecosystemCategory.Channels, categoryChannelID)
						} else {
							channelIds = append(channelIds, categoryChannelID)
						}
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

		// Old organization categories, those have no explicit org association, but they follow a naming convention we can use to migrate them
		for _, categoryChannelID := range category.Channels {
			channelProcessed := false
			for _, channel := range allChannels.Items {
				if channel.Id == categoryChannelID {
					formattedChannelName := strings.ToLower(strings.ReplaceAll(channel.DisplayName, " ", "-"))
					for _, organization := range config.Organizations {
						formattedOrganizationName := strings.ToLower(strings.ReplaceAll(organization.Name, " ", "-"))
						if strings.Contains(formattedChannelName, formattedOrganizationName) {
							// We matched this channel to an organization. We assume the channel's entry in the CSA_channels table exists already
							if err := s.channelStore.LinkChannelToOrganization(channel.Id, organization.ID); err != nil {
								s.api.LogWarn("found a channel implicitly related to an organization but failed to make the link explicit", "channelID", channel.Id, "organizationID", organization.ID)
							} else {
								s.api.LogInfo("organization channel without an explicit orgID migrated successfully", "channelID", channel.Id, "organizationID", organization.ID)
							}
							channelProcessed = true
							break
						}
					}
					if channelProcessed {
						break
					}
				}
			}
			channelProcessed = false
		}

		category.Channels = []string{}
		categoriesToRemove = append(categoriesToRemove, category)
	}

	if _, err := s.api.UpdateChannelSidebarCategories(userID, teamID, categories.Categories); err != nil {
		return errors.Wrap(err, "could not update categories for team")
	}

	if err := s.categoryStore.DeleteCategories(categoriesToRemove); err != nil {
		return errors.Wrap(err, "could not delete leftover categories")
	}

	return nil
}

func (s *CategoryService) buildOrganizationCategory(teamID, userID string, organization config.Organization) (*model.SidebarCategoryWithChannels, error) {
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

func (s *CategoryService) addChannelToEcosystemCategory(userID, teamID, channelID string) error {
	return s.addChannelToCategory(userID, teamID, channelID, "Ecosystem")
}

// Matches category based on name.
func (s *CategoryService) addChannelToCategory(userID, teamID, channelID, categoryName string) error {
	var targetCategory *model.SidebarCategoryWithChannels

	categories, err := s.api.GetChannelSidebarCategories(userID, teamID)
	if err != nil {
		return fmt.Errorf("couldn't get categories for user %s", userID)
	}

	for _, category := range categories.Categories {
		// TODO use custom SidebarCategoryType?
		if category.DisplayName == categoryName {
			targetCategory = category
			break
		}
	}

	targetCategory.Channels = append(targetCategory.Channels, channelID)

	if _, err := s.api.UpdateChannelSidebarCategories(userID, teamID, categories.Categories); err != nil {
		return errors.Wrap(err, "could not update categories for team")
	}

	return nil
}
