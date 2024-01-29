package app

import (
	mattermost "github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
)

// A representation of a Mattermost Post in STIX format, encoded as an opinion.
type STIXPost struct {
	ID                 string      `json:"id"`
	SpecVersion        string      `json:"spec_version"`
	Type               string      `json:"type"`
	Created            int64       `json:"created"`
	Modified           int64       `json:"modified"`
	Authors            []string    `json:"authors"`
	Opinion            string      `json:"opinion"`
	Labels             []string    `json:"labels"`
	ExternalReferences []string    `json:"external_references"` // Used for file attachments
	ObjectRefs         []*STIXPost `json:"object_refs"`
}

func ToStixPost(api plugin.API, post *mattermost.Post, withThreadPosts bool, usersCache map[string]*mattermost.User) *STIXPost {
	stixThreadPosts := []*STIXPost{}
	if withThreadPosts {
		threadPostList, err := api.GetPostThread(post.Id)
		if err != nil {
			api.LogInfo("error with GetPostThread", "err", err)
		} else {
			threadPosts := threadPostList.ToSlice()[1:]

			stixThreadPosts = make([]*STIXPost, 0, len(threadPosts))
			for _, threadPost := range threadPosts {
				stixThreadPosts = append(stixThreadPosts, ToStixPost(api, threadPost, false, usersCache))
			}
		}
	}

	fileLinks := make([]string, 0, len(post.FileIds))
	for _, fileID := range post.FileIds {
		fileURL, err := api.GetFileLink(fileID)
		if err != nil {
			api.LogWarn("Failed to get URL for file during STIX post conversion", "fileId", fileID, "err", err)
			continue
		}
		fileLinks = append(fileLinks, fileURL)
	}

	user, ok := usersCache[post.UserId]
	if !ok {
		newUser, err := api.GetUser(post.UserId)
		if err != nil {
			api.LogWarn("failed retrieving post author during STIX post conversion")
		} else {
			usersCache[post.UserId] = newUser
			user = newUser
		}
	}
	userName := ""
	if user != nil {
		userName = user.GetDisplayName(mattermost.ShowNicknameFullName)
	}

	labels := []string{}
	if post.IsPinned {
		labels = append(labels, "pinned")
	}

	return &STIXPost{
		ID:                 post.Id,
		SpecVersion:        stixVersion,
		Type:               stixOpinion,
		Created:            post.CreateAt,
		Modified:           post.EditAt,
		Authors:            []string{userName},
		Opinion:            post.Message,
		Labels:             labels,
		ExternalReferences: fileLinks,
		ObjectRefs:         stixThreadPosts,
	}
}
