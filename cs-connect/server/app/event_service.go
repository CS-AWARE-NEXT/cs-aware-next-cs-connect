package app

import (
	"fmt"

	"github.com/mattermost/mattermost-server/v6/plugin"
)

type EventService struct {
	api plugin.API
}

// NewEventService returns a new platform config service
func NewEventService(api plugin.API) *EventService {
	return &EventService{
		api: api,
	}
}

func (s *EventService) UserAdded(params UserAddedParams) error {
	s.api.LogInfo("Params on user added", "params", params)
	channels, err := s.api.GetPublicChannelsForTeam(params.TeamID, 0, 200)
	if err != nil {
		return fmt.Errorf("couldn't get public channels for team %s", params.TeamID)
	}
	for _, channel := range channels {
		if _, err := s.api.AddChannelMember(channel.Id, params.UserID); err != nil {
			return fmt.Errorf("couldn't add channel %s to user %s", channel.Id, params.UserID)
		}
	}
	return nil
}
