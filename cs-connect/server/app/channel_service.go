package app

import (
	"fmt"
	"net/url"
	"sort"
	"strings"

	mattermost "github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
	"github.com/pkg/errors"

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

// Checks a post's message for the presence of cs-connect markdown links. In such case, they're added as backlinks.
func (s *ChannelService) AddBacklinkIfPresent(post *mattermost.Post) {
	serverConfig := s.api.GetConfig()
	// ignore messages containing links not related to cs-connect
	siteURL := *serverConfig.ServiceSettings.SiteURL

	markdownMatches := s.markdownRegex.FindAllStringSubmatch(post.Message, -1)
	if len(markdownMatches) == 0 {
		return
	}
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
				// This can happen for organization links for example
				if queryAndFragment == "" {
					queryAndFragment = parsedURL.Path
				}
				backlinksToAdd = append(backlinksToAdd, BacklinkData{MarkdownText: markdownText, MarkdownLink: queryAndFragment})
			}
		}
	}

	if len(backlinksToAdd) == 0 {
		return
	}

	err := s.store.AddBacklinks(post.Id, backlinksToAdd)
	if err != nil {
		s.api.LogError("failed to add backlinks", "backlinks", backlinksToAdd, "post", post, "err", err)
	}
}

// Fetches the backlinks of an element identified by its full URL, sorted by most recent first
func (s *ChannelService) GetBacklinks(elementURL string, userID string) (GetBacklinksResult, error) {
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
	if queryAndFragment == "" {
		queryAndFragment = parsedURL.Path
	}

	dbBacklinks, err := s.store.GetBacklinks(queryAndFragment)
	if err != nil {
		return GetBacklinksResult{}, err
	}
	platformConfig, err := s.platformService.GetPlatformConfig()
	if err != nil {
		return GetBacklinksResult{}, err
	}

	backlinks := []Backlink{}
	for _, backlink := range dbBacklinks {
		post, err := s.api.GetPost(backlink.PostID)
		if err != nil {
			s.api.LogWarn("failed to fetch post while fetching backlinks", "elementPath", elementURL, "postID", backlink.PostID, "err", err)
			delErr := s.store.DeleteBacklink(backlink.ID)
			if delErr != nil {
				s.api.LogWarn("failed to delete post while fetching backlinks", "elementPath", elementURL, "postID", backlink.PostID, "err", delErr)
			}
			continue
		}
		// Do not show backlinks from channels the user isn't in
		_, membershipErr := s.api.GetChannelMember(post.ChannelId, userID)
		if membershipErr != nil {
			continue
		}
		user, err := s.api.GetUser(post.UserId)
		if err != nil {
			s.api.LogWarn("failed to fetch post author while fetching backlinks", "elementPath", elementURL, "postID", backlink.PostID, "err", err)
			continue
		}
		channel, err := s.api.GetChannel(post.ChannelId)
		if err != nil {
			s.api.LogWarn("failed to fetch post channel while fetching backlinks", "elementPath", elementURL, "postID", backlink.PostID, "err", err)
			continue
		}
		csConnectChannel, csConnectErr := s.store.GetChannelByID(post.ChannelId)
		if csConnectErr != nil {
			s.api.LogWarn("failed to fetch cs-connect post channel while fetching backlinks", "elementPath", elementURL, "postID", backlink.PostID, "err", csConnectErr)
			continue
		}

		sectionName := "unknown section"
		for _, org := range platformConfig.Organizations {
			if org.ID == csConnectChannel.OrganizationID {
				for _, section := range org.Sections {
					if section.ID == csConnectChannel.ParentID {
						sectionName = section.Name
					}
				}
			}
		}

		backlinks = append(backlinks, Backlink{
			ID:          backlink.PostID,
			Message:     post.Message,
			AuthorName:  user.GetDisplayName(mattermost.ShowNicknameFullName),
			ChannelName: channel.DisplayName,
			SectionName: sectionName,
			CreateAt:    post.CreateAt,
		})
	}

	// Most recent first
	sort.Slice(backlinks, func(i, j int) bool {
		return backlinks[i].CreateAt > backlinks[j].CreateAt
	})

	channelsCountMap := make(map[string]*ChannelsCount)
	for _, backlink := range backlinks {
		if count, found := channelsCountMap[backlink.ChannelName]; found {
			count.Count++
		} else {
			channelsCountMap[backlink.ChannelName] = &ChannelsCount{backlink.ChannelName, 1, backlink.SectionName}
		}
	}

	channelsCount := []*ChannelsCount{}
	for _, count := range channelsCountMap {
		channelsCount = append(channelsCount, count)
	}

	// Order by count desc
	sort.Slice(channelsCount, func(i, j int) bool {
		return channelsCount[i].Count > channelsCount[j].Count
	})

	return GetBacklinksResult{Items: backlinks, ChannelCount: channelsCount}, nil
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
		usersCache := make(map[string]*mattermost.User)

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
