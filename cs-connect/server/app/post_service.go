package app

import (
	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/util"
)

type PostService struct {
	api            plugin.API
	channelService *ChannelService
}

// NewPostService returns a new posts service
func NewPostService(api plugin.API, channelService *ChannelService) *PostService {
	return &PostService{
		api:            api,
		channelService: channelService,
	}
}

func (s *PostService) GetPostsByIds(params PostsByIdsParams) (GetPostsByIdsResult, error) {
	s.api.LogInfo("Getting posts", "postIds", params.PostIds)
	posts := []Post{}
	for _, id := range params.PostIds {
		post, err := s.api.GetPost(id)
		if err == nil {
			posts = append(posts, Post{
				ID:      post.Id,
				Message: post.Message,
			})
		}
	}
	return GetPostsByIdsResult{Posts: posts}, nil
}

func (s *PostService) GetPostsForTeam(teamID string) (IDMappedPosts, error) {
	postsMap := make(map[string]*model.Post)
	result, err := s.channelService.GetChannelsForTeam(teamID)
	if err != nil {
		return IDMappedPosts{}, err
	}
	channels := result.Items
	for _, channel := range channels {
		posts, err := s.api.GetPostsForChannel(channel.Id, 0, 200)
		if err != nil {
			return IDMappedPosts{}, err
		}
		util.MergeMaps(postsMap, posts.Posts)
	}
	return IDMappedPosts{Posts: postsMap}, nil
}
