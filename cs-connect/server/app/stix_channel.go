package app

import (
	"time"

	mattermost "github.com/mattermost/mattermost-server/v6/model"
)

// A representation of a Mattermost Channel in STIX format, encoded as a report.
type STIXChannel struct {
	ID                 string            `json:"id"`
	SpecVersion        string            `json:"spec_version"`
	Type               string            `json:"type"`
	Created            int64             `json:"created"`
	Modified           int64             `json:"modified"`
	Name               string            `json:"name"`
	Description        string            `json:"description"`
	ChannelURL         string            `json:"channel_url"`
	Published          int64             `json:"published"`
	ObjectRefs         []*STIXPost       `json:"object_refs"`
	ExternalReferences []ExportReference `json:"external_references"`
}

func ToStixChannel(
	channel *mattermost.Channel,
	opinions []*STIXPost,
	extraReferences []ExportReference,
	channelURL string,
) *STIXChannel {
	return &STIXChannel{
		ID:                 channel.Id,
		SpecVersion:        stixVersion,
		Type:               stixReport,
		Created:            channel.CreateAt,
		Modified:           channel.UpdateAt,
		Name:               channel.DisplayName,
		Description:        channel.Header,
		ChannelURL:         channelURL,
		Published:          time.Now().UnixMilli(),
		ObjectRefs:         opinions,
		ExternalReferences: extraReferences,
	}
}
