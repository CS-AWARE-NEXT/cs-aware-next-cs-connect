package app

import (
	"time"

	mattermost "github.com/mattermost/mattermost-server/v6/model"
)

// A representation of a Mattermost Channel in STIX format, encoded as a report.
type STIXChannel struct {
	ID          string      `json:"id"`
	SpecVersion string      `json:"spec_version"`
	Type        string      `json:"type"`
	Created     int64       `json:"created"`
	Modified    int64       `json:"modified"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Published   int64       `json:"published"`
	ObjectRefs  []*STIXPost `json:"object_refs"`
}

func ToStixChannel(channel *mattermost.Channel, opinions []*STIXPost) *STIXChannel {
	return &STIXChannel{
		ID:          channel.Id,
		SpecVersion: stixVersion,
		Type:        stixReport,
		Created:     channel.CreateAt,
		Modified:    channel.UpdateAt,
		Name:        channel.DisplayName,
		Description: channel.Header,
		Published:   time.Now().UnixMilli(),
		ObjectRefs:  opinions,
	}
}
