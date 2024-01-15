package app

import (
	"fmt"
	"net/url"
	"sort"
	"strings"

	mattermost "github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/config"

	"regexp"
)

type ChannelService struct {
	api                    plugin.API
	store                  ChannelStore
	mattermostChannelStore MattermostChannelStore
	categoryService        *CategoryService
	platformService        *config.PlatformService
	markdownRegex          *regexp.Regexp // Regex for matching markdown links, e.g. [some text here](a link here). Only the outer structure matters, the link is not strictly checked to be an actual link.
}

// NewChannelService returns a new channels service
func NewChannelService(api plugin.API, store ChannelStore, mattermostChannelStore MattermostChannelStore, categoryService *CategoryService, platformService *config.PlatformService) *ChannelService {
	return &ChannelService{
		api:                    api,
		store:                  store,
		mattermostChannelStore: mattermostChannelStore,
		categoryService:        categoryService,
		platformService:        platformService,
		markdownRegex:          regexp.MustCompile(`\[(.*)\]\(([^\(]+)\)`),
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

// Checks a post's message for the presence of cs-connect markdown links. In such case, they're added as backlinks.
func (s *ChannelService) AddBacklinkIfPresent(post *mattermost.Post) {
	channel, getChannelErr := s.api.GetChannel(post.ChannelId)
	if getChannelErr != nil {
		s.api.LogError("failed to add backlinks", "post", post, "err (no channel found for post)", getChannelErr)
		return
	}
	serverConfig := s.api.GetConfig()
	siteURL := *serverConfig.ServiceSettings.SiteURL

	markdownMatches := s.markdownRegex.FindAllStringSubmatch(post.Message, -1)
	backlinksToAdd := []BacklinkData{}

	for _, match := range markdownMatches {
		markdownText := match[1]
		markdownLink := match[2]

		parsedURL, err := url.Parse(markdownLink)
		if err == nil {
			if strings.Contains(siteURL, parsedURL.Host) {
				queryAndFragment := parsedURL.RawQuery
				if parsedURL.Fragment != "" {
					queryAndFragment = fmt.Sprintf("%s#%s", parsedURL.RawQuery, parsedURL.Fragment)
				}
				backlinksToAdd = append(backlinksToAdd, BacklinkData{MarkdownText: markdownText, MarkdownLink: queryAndFragment})
			}
		}
	}

	err := s.store.AddBacklinks(post.Id, post.UserId, post.ChannelId, channel.TeamId, backlinksToAdd)
	if err != nil {
		s.api.LogError("failed to add backlinks", "backlinks", backlinksToAdd, "post", post, "err", err)
	}
}

// Fetches the backlinks of an element identified by its full URL, sorted by most recent first
func (s *ChannelService) GetBacklinks(elementURL string) (GetBacklinksResult, error) {
	s.api.LogInfo("Getting backlinks for url", "url", elementURL)
	parsedURL, err := url.Parse(elementURL)
	if err != nil {
		s.api.LogError("failed to get backlinks", "couldn't parse url", err)
		return GetBacklinksResult{}, err
	}
	queryAndFragment := parsedURL.RawQuery
	if parsedURL.Fragment != "" {
		queryAndFragment = fmt.Sprintf("%s#%s", parsedURL.RawQuery, parsedURL.Fragment)
	}

	postIds, err := s.store.GetBacklinks(queryAndFragment)
	if err != nil {
		return GetBacklinksResult{}, err
	}

	backlinks := []Backlink{}
	for _, postID := range postIds {
		post, err := s.api.GetPost(postID)
		if err != nil {
			s.api.LogWarn("failed to fetch post while fetching backlinks", "elementPath", elementURL, "postID", postID)
			continue
		}
		user, err := s.api.GetUser(post.UserId)
		if err != nil {
			s.api.LogWarn("failed to fetch post author while fetching backlinks", "elementPath", elementURL, "postID", postID)
			continue
		}
		channel, err := s.api.GetChannel(post.ChannelId)
		if err != nil {
			s.api.LogWarn("failed to fetch post channel while fetching backlinks", "elementPath", elementURL, "postID", postID)
			continue
		}

		backlinks = append(backlinks, Backlink{
			ID:          postID,
			Message:     post.Message,
			AuthorName:  user.GetDisplayName(mattermost.ShowNicknameFullName),
			ChannelName: channel.DisplayName,
			CreateAt:    post.CreateAt,
		})
	}

	// Most recent first
	sort.Slice(backlinks, func(i, j int) bool {
		return backlinks[i].CreateAt > backlinks[j].CreateAt
	})

	return GetBacklinksResult{Items: backlinks}, nil
}
