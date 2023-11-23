package sqlstore

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/pkg/errors"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/app"
)

// An interface to the Mattermost channels table for operations not currently supported by the RPC API.
type mattermostChannelStore struct {
	pluginAPI    PluginAPIClient
	store        *SQLStore
	queryBuilder sq.StatementBuilderType
}

var _ app.MattermostChannelStore = (*mattermostChannelStore)(nil)

func NewMattermostChannelStore(pluginAPI PluginAPIClient, sqlStore *SQLStore) app.MattermostChannelStore {
	return &mattermostChannelStore{
		pluginAPI:    pluginAPI,
		store:        sqlStore,
		queryBuilder: sqlStore.builder,
	}
}

// Get all channels associated to a team. This returns private channels as well, unlike the RPC API method.
func (s *mattermostChannelStore) GetChannelsForTeam(teamID string) (app.GetMattermostChannelsResults, error) {
	queryForResults := s.queryBuilder.Select("*").
		From("channels").
		Where(sq.Eq{"teamid": teamID})
	var channels []model.Channel

	err := s.store.selectBuilder(s.store.db, &channels, queryForResults)
	if err != nil {
		return app.GetMattermostChannelsResults{}, errors.Wrap(err, "could not get channels")
	}

	return app.GetMattermostChannelsResults{Items: channels}, nil
}
