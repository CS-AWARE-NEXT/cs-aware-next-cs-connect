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
func (s *mattermostChannelStore) GetChannelsForTeam(teamID string) ([]model.Channel, error) {
	queryForResults := s.queryBuilder.Select("*").
		From("channels").
		Where(sq.Eq{"teamid": teamID})
	var channels []model.Channel

	err := s.store.selectBuilder(s.store.db, &channels, queryForResults)
	if err != nil {
		return nil, errors.Wrap(err, "could not get channels")
	}

	return channels, nil
}

// Forcefully remove a member from a channel. Unlike the RPC API, this allows removing the last member of a private channel.
// Currently does not support updating the cache.
func (s *mattermostChannelStore) ForceMemberLeave(channelID, userID string) error {
	tx, err := s.store.db.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer s.store.finalizeTransaction(tx)

	if _, err := s.store.execBuilder(tx, sq.
		Delete("channelmembers").
		Where(sq.Eq{"channelid": channelID}).
		Where(sq.Eq{"userid": userID})); err != nil {
		return errors.Wrap(err, "could not add existing channel to section")
	}

	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}

	return nil
}
