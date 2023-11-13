package app

import "github.com/mattermost/mattermost-server/v6/model"

type MattermostChannelStore interface {
	GetChannelsForTeam(teamID string) ([]model.Channel, error)
}
