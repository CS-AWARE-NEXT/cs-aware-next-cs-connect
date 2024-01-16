package app

import (
	"github.com/mattermost/mattermost-server/v6/plugin"
)

type PostService struct {
	api plugin.API
}

// NewPostService returns a new posts service
func NewPostService(api plugin.API) *PostService {
	return &PostService{
		api: api,
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
