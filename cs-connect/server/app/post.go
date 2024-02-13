package app

import "github.com/mattermost/mattermost-server/v6/model"

type Post struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}

type PostsByIdsParams struct {
	PostIds []string `json:"postIds"`
}

type GetPostsByIdsResult struct {
	Posts []Post `json:"posts"`
}

type IDMappedPosts struct {
	Posts map[string]*model.Post `json:"posts"`
}
