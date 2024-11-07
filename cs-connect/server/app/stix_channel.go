package app

import (
	"time"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/util"

	mattermost "github.com/mattermost/mattermost-server/v6/model"
)

// A representation of a Mattermost Channel in STIX format, encoded as a report.
type STIXChannel struct {
	ID                 string            `json:"id"`
	SpecVersion        string            `json:"spec_version"`
	Type               string            `json:"type"`
	Created            string            `json:"created"`
	Modified           string            `json:"modified"`
	Name               string            `json:"name"`
	Description        string            `json:"description"`
	ChannelURL         string            `json:"channel_url"`
	Published          string            `json:"published"`
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
		Created:            util.ConvertUnixMilliToUTC(channel.CreateAt),
		Modified:           util.ConvertUnixMilliToUTC(channel.UpdateAt),
		Name:               channel.DisplayName,
		Description:        channel.Header,
		ChannelURL:         channelURL,
		Published:          util.ConvertUnixMilliToUTC(time.Now().UnixMilli()),
		ObjectRefs:         opinions,
		ExternalReferences: extraReferences,
	}
}
