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
	platformConfig, err := s.platformService.GetPlatformConfig()
	if err != nil {
		return err
	}

	allChannels, allChannelsErr := s.mattermostChannelStore.GetChannelsForTeam(teamID)
	if allChannelsErr != nil {
		return fmt.Errorf("couldn't get all channels of team %s", teamID)
	}

	allOrganizationsChannels, xerr := s.channelStore.GetAllChannels()
	if xerr != nil {
		return fmt.Errorf("couldn't get all organizations channels: %s", xerr.Error())
	}

	// Old organization categories, those have no explicit org association, but they follow a naming convention we can use to migrate them
	s.migrateImplicitOrgChannels(allOrganizationsChannels.Items, allChannels.Items, platformConfig.Organizations)

	// choose migration strategy based on the selected org id
	user, userErr := s.api.GetUser(userID)
	if userErr != nil {
		return errors.Wrap(userErr, "could not fetch user to set orgID prop")
	}
	orgID, found := user.GetProp("orgId")
	if !found || orgID == "" {
		// Silent fail, we'll retry when the user sets his organization
		s.api.LogWarn("couldn't setup categories: the user has not selected an organization yet", "userID", userID)
		return nil
	}
	if orgID == config.OrganizationIDAll {
		if setupErr := s.setupOrganizationCategories(allOrganizationsChannels.Items, userID, teamID); setupErr != nil {
			return errors.Wrap(setupErr, "error while setting organization categories")
		}
	} else {
		if setupErr := s.purgeNonEcosystemCategories(categories.Categories, platformConfig, userID, teamID); setupErr != nil {
			return errors.Wrap(setupErr, "error while purging organization categories")
		}
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
	platformConfig, err := s.platformService.GetPlatformConfig()
	if err != nil {
		return err
	}

	for _, organization := range platformConfig.Organizations {
		if organization.IsEcosystem {
			return s.addChannelToCategory(userID, teamID, channelID, organization.Name)
		}
	}
	return fmt.Errorf("ecosystem not found")
}

func (s *CategoryService) addChannelToCategoryByOrganizationID(userID, teamID, channelID, orgID string) error {
	platformConfig, err := s.platformService.GetPlatformConfig()
	if err != nil {
		return err
	}

	for _, organization := range platformConfig.Organizations {
		if organization.ID == orgID {
			return s.addChannelToCategory(userID, teamID, channelID, organization.Name)
		}
	}
	return fmt.Errorf("organization not found not found")
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

	if targetCategory == nil {
		return fmt.Errorf("category with name %s not found for user %s", categoryName, userID)
	}

	targetCategory.Channels = append(targetCategory.Channels, channelID)

	if _, err := s.api.UpdateChannelSidebarCategories(userID, teamID, categories.Categories); err != nil {
		return errors.Wrap(err, "could not update categories for team")
	}

	return nil
}

func (s *CategoryService) setupCategories(userID, teamID string) error {
	s.api.LogInfo("Setting up categories")
	config, err := s.platformService.GetPlatformConfig()
	if err != nil {
		return err
	}
	categories, catErr := s.api.GetChannelSidebarCategories(userID, teamID)
	if catErr != nil {
		s.api.LogError(fmt.Sprintf("Could not get sidebar categories due to %s", catErr.Error()))
		return catErr
	}
	if s.hasEachOrganizationCategory(config, categories) {
		return nil
	}
	for _, organization := range config.Organizations {
		if s.hasOrganizationCategory(organization, categories) {
			continue
		}
		category, err := s.buildOrganizationCategory(teamID, userID, organization)
		if err != nil {
			continue
		}
		if _, err := s.api.CreateChannelSidebarCategory(userID, teamID, category); err != nil {
			s.api.LogError(fmt.Sprintf("Could not create sidebar category due to %s", err.Error()))
			continue
		}
	}
	return nil
}

func (s *CategoryService) hasEachOrganizationCategory(config *config.PlatformConfig, categories *model.OrderedSidebarCategories) bool {
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

func (s *CategoryService) hasOrganizationCategory(organization config.Organization, categories *model.OrderedSidebarCategories) bool {
	for _, category := range categories.Categories {
		if strings.Contains(strings.ToLower(category.DisplayName), strings.ToLower(organization.Name)) {
			return true
		}
	}
	return false
}

// Setup one category per organization, where the org's channels will reside. We assume the user is already a member of all the channels passed as argument.
// The channel's name is used to figure out which organization it is related to (org name as substring of the channel name).
func (s *CategoryService) setupOrganizationCategories(orgChannels []Channel, userID, teamID string) error {
	if err := s.setupCategories(userID, teamID); err != nil {
		return errors.Wrapf(err, "Could not setup categories")
	}

	categories, err := s.api.GetChannelSidebarCategories(userID, teamID)
	if err != nil {
		return fmt.Errorf("couldn't get categories for user %s", userID)
	}

	config, configErr := s.platformService.GetPlatformConfig()
	if configErr != nil {
		return fmt.Errorf("couldn't get config")
	}

	var skippedIds []string
	for _, category := range categories.Categories {
		// Remove organization channels from the default category
		if category.Type == model.SidebarCategoryChannels {
			var channelIds []string
			for _, channelID := range category.Channels {
				found := false
				for _, orgChannel := range orgChannels {
					// An empty org id is only possible for channels with names that do not have the org name as substring, and which need to be migrated manually.
					if orgChannel.ChannelID == channelID {
						found = true
						if orgChannel.OrganizationID == "" {
							channelIds = append(channelIds, channelID)
						} else {
							skippedIds = append(skippedIds, channelID)
						}
						break
					}
				}
				if !found {
					channelIds = append(channelIds, channelID)
				}
			}
			category.Channels = channelIds
			break
		}
	}

	for _, category := range categories.Categories {
		// Identify the organization of this category by the name
		formattedCategoryName := strings.ToLower(strings.ReplaceAll(category.DisplayName, " ", "-"))
		for _, organization := range config.Organizations {
			formattedOrganizationName := strings.ToLower(strings.ReplaceAll(organization.Name, " ", "-"))
			if formattedOrganizationName == formattedCategoryName {
				// We got the corresponding organization id, now we can add all the related channels
				for _, channel := range orgChannels {
					// Skip channels that weren't in the default category
					// this is useful to avoid adding channels from other teams since we do not track the team ID yet (we should)
					valid := false
					for _, cid := range skippedIds {
						if cid == channel.ChannelID {
							valid = true
							break
						}
					}
					if !valid {
						continue
					}

					// Skip channels already under this categories
					contained := false
					for _, channelID := range category.Channels {
						if channel.ChannelID == channelID {
							contained = true
							break
						}
					}
					if contained {
						continue
					}

					// Skip channels unrelated to this organization
					if channel.OrganizationID != organization.ID {
						continue
					}

					category.Channels = append(category.Channels, channel.ChannelID)
				}
			}
		}
	}

	if _, err := s.api.UpdateChannelSidebarCategories(userID, teamID, categories.Categories); err != nil {
		return errors.Wrap(err, "could not update categories for team to add channel")
	}

	return nil
}

// Purge all organization specific categories, bar the ecosystem category which is kept. All the organization channels will be moved in the Mattermost default Channels category.
func (s *CategoryService) purgeNonEcosystemCategories(categories model.SidebarCategoriesWithChannels, config *config.PlatformConfig, userID, teamID string) error {
	var ecosystemCategory *model.SidebarCategoryWithChannels
	var categoriesToRemove []*model.SidebarCategoryWithChannels

	ecosystem, ecosystemFound := config.GetEcosystem()
	if !ecosystemFound {
		return fmt.Errorf("couldn't get ecosystem")
	}

	for _, category := range categories {
		// TODO use custom SidebarCategoryType?
		if category.DisplayName == "Ecosystem" {
			ecosystemCategory = category
			break
		}
	}

	// Create if absent
	if ecosystemCategory == nil {
		ecosystemCategory, _ = s.buildOrganizationCategory(teamID, userID, *ecosystem)

		if _, catErr := s.api.CreateChannelSidebarCategory(userID, teamID, ecosystemCategory); catErr != nil {
			return errors.Wrap(catErr, "Could not create sidebar category")
		}
	}

	allOrganizationsChannels, xerr := s.channelStore.GetAllChannels()
	if xerr != nil {
		return fmt.Errorf("couldn't get all organizations channels: %s", xerr.Error())
	}

	for _, category := range categories {
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

	if _, err := s.api.UpdateChannelSidebarCategories(userID, teamID, categories); err != nil {
		return errors.Wrap(err, "could not update categories for team")
	}

	if err := s.categoryStore.DeleteCategories(categoriesToRemove); err != nil {
		return errors.Wrap(err, "could not delete leftover categories")
	}

	return nil
}

func (s *CategoryService) migrateImplicitOrgChannels(orgChannels []Channel, channels []model.Channel, organizations []config.Organization) {
	for _, orgChannel := range orgChannels {
		if orgChannel.OrganizationID != "" {
			continue
		}
		for _, channel := range channels {
			if channel.Id == orgChannel.ChannelID {
				formattedChannelName := strings.ToLower(strings.ReplaceAll(channel.DisplayName, " ", "-"))
				for _, organization := range organizations {
					formattedOrganizationName := strings.ToLower(strings.ReplaceAll(organization.Name, " ", "-"))
					if strings.Contains(formattedChannelName, formattedOrganizationName) {
						// We matched this channel to an organization. We assume the channel's entry in the CSA_channels table exists already
						if err := s.channelStore.LinkChannelToOrganization(channel.Id, organization.ID); err != nil {
							s.api.LogWarn("found a channel implicitly related to an organization but failed to make the link explicit", "channelID", channel.Id, "organizationID", organization.ID)
						} else {
							s.api.LogInfo("organization channel without an explicit orgID migrated successfully", "channelID", channel.Id, "organizationID", organization.ID)
						}
						break
					}
				}
				break
			}
		}
	}
}
