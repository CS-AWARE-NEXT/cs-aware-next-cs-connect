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
	api             plugin.API
	platformService *config.PlatformService
	channelStore    ChannelStore
	categoryStore   CategoryStore
}

// NewCategoryService returns a new channels service
func NewCategoryService(api plugin.API, platformService *config.PlatformService, channelStore ChannelStore, categoryStore CategoryStore) *CategoryService {
	return &CategoryService{
		api:             api,
		platformService: platformService,
		channelStore:    channelStore,
		categoryStore:   categoryStore,
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
