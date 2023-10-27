package sqlstore

import (
	"database/sql"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"

	sq "github.com/Masterminds/squirrel"
	"github.com/mattermost/mattermost-server/v6/model"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/app"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/util"
)

// channelStore is a sql store for channels
// Use NewChannelStore to create it
type channelStore struct {
	pluginAPI    PluginAPIClient
	store        *SQLStore
	queryBuilder sq.StatementBuilderType

	channelsSelect sq.SelectBuilder
}

// This is a way to implement interface explicitly
var _ app.ChannelStore = (*channelStore)(nil)

// NewChannelStore creates a new store for channel service.
func NewChannelStore(pluginAPI PluginAPIClient, sqlStore *SQLStore) app.ChannelStore {
	channelsSelect := sqlStore.builder.
		Select(
			"ChannelID",
			"ParentID",
			"SectionID",
		).
		From("CSA_Channel")

	return &channelStore{
		pluginAPI:      pluginAPI,
		store:          sqlStore,
		queryBuilder:   sqlStore.builder,
		channelsSelect: channelsSelect,
	}
}

// GetChannels retrieves all channels for a section
func (s *channelStore) GetChannels(sectionID string, parentID string) (app.GetChannelsResults, error) {
	queryForResults := s.channelsSelect.Where(sq.Eq{"SectionID": sectionID}).Where(sq.Eq{"ParentID": parentID})
	var channelsEntities []ChannelEntity
	err := s.store.selectBuilder(s.store.db, &channelsEntities, queryForResults)
	if err == sql.ErrNoRows {
		return app.GetChannelsResults{}, errors.Wrap(app.ErrNotFound, "no channels found for the section")
	} else if err != nil {
		return app.GetChannelsResults{}, errors.Wrap(err, "failed to get channels for the section")
	}

	return app.GetChannelsResults{
		Items: s.toChannels(channelsEntities),
	}, nil
}

// GetChannelByID retrieves a channel given the channel id
func (s *channelStore) GetChannelByID(channelID string) (app.GetChannelByIDResult, error) {
	queryForResult := s.channelsSelect.Where(sq.Eq{"ChannelID": channelID})
	var channel ChannelEntity
	err := s.store.getBuilder(s.store.db, &channel, queryForResult)
	if err == sql.ErrNoRows {
		return app.GetChannelByIDResult{}, errors.Wrap(app.ErrNotFound, "no channel found for the given id")
	} else if err != nil {
		return app.GetChannelByIDResult{}, errors.Wrap(err, "failed to get channel for the given id")
	}

	return app.GetChannelByIDResult{
		Channel: s.toChannel(channel),
	}, nil
}

// AddChannel adds a channel to a product
func (s *channelStore) AddChannel(sectionID string, params app.AddChannelParams) (app.AddChannelResult, error) {
	if sectionID == "" {
		return app.AddChannelResult{}, errors.New("SectionID cannot be empty")
	}
	if strings.TrimSpace(params.ChannelID) != "" {
		return s.addExistingChannel(sectionID, params)
	}
	return s.createChannel(sectionID, params)
}

func (s *channelStore) addExistingChannel(sectionID string, params app.AddChannelParams) (app.AddChannelResult, error) {
	tx, err := s.store.db.Beginx()
	if err != nil {
		return app.AddChannelResult{}, errors.Wrap(err, "could not begin transaction")
	}
	defer s.store.finalizeTransaction(tx)

	if _, err := s.store.execBuilder(tx, sq.
		Insert("CSA_Channel").
		SetMap(map[string]interface{}{
			"ChannelID": params.ChannelID,
			"ParentID":  params.ParentID,
			"SectionID": sectionID,
		})); err != nil {
		return app.AddChannelResult{}, errors.Wrap(err, "could not add existing channel to section")
	}
	if err := tx.Commit(); err != nil {
		return app.AddChannelResult{}, errors.Wrap(err, "could not commit transaction")
	}
	return app.AddChannelResult{
		ChannelID: params.ChannelID,
		ParentID:  params.ParentID,
		SectionID: sectionID,
	}, nil
}

func (s *channelStore) createChannel(sectionID string, params app.AddChannelParams) (app.AddChannelResult, error) {
	tx, err := s.store.db.Beginx()
	if err != nil {
		return app.AddChannelResult{}, errors.Wrap(err, "could not begin transaction")
	}
	defer s.store.finalizeTransaction(tx)
	channel, err := s.createAndAddChannel(params)
	if err != nil {
		return app.AddChannelResult{}, errors.Wrap(err, "could not add new channel")
	}
	if _, err := s.store.execBuilder(tx, sq.
		Insert("CSA_Channel").
		SetMap(map[string]interface{}{
			"ChannelID": channel.Id,
			"ParentID":  params.ParentID,
			"SectionID": sectionID,
		})); err != nil {
		return app.AddChannelResult{}, errors.Wrap(err, "could not add new channel to section")
	}
	if err := tx.Commit(); err != nil {
		return app.AddChannelResult{}, errors.Wrap(err, "could not commit transaction")
	}
	return app.AddChannelResult{
		ChannelID: channel.Id,
		ParentID:  params.ParentID,
		SectionID: sectionID,
	}, nil
}

func (s *channelStore) createAndAddChannel(params app.AddChannelParams) (*model.Channel, error) {
	channel, err := s.pluginAPI.API.CreateChannel(&model.Channel{
		TeamId:      params.TeamID,
		Type:        s.getChannelType(params),
		DisplayName: params.ChannelName,
		Name:        strings.ToLower(strings.Join(strings.Fields(params.ChannelName), "-")),
	})
	if err != nil {
		return nil, errors.Wrap(err, "could not create channel to add")
	}
	members, err := s.pluginAPI.API.GetTeamMembers(params.TeamID, 0, 200)
	if err != nil {
		return nil, errors.Wrap(err, "could not add channel to users in team")
	}
	for _, member := range members {
		if _, err := s.pluginAPI.API.AddChannelMember(channel.Id, member.UserId); err != nil {
			return nil, errors.Wrap(err, "could not add channel to user's channel list")
		}
	}

	// if err := s.addChannelToCategory(channel, params); err != nil {
	// 	// TODO: choose what to do here
	// 	return channel, nil
	// }

	return channel, nil
}

// func (s *channelStore) addChannelToCategory(channel *model.Channel, params app.AddChannelParams) error {
// 	categories, err := s.pluginAPI.API.GetChannelSidebarCategories(params.UserID, params.TeamID)
// 	if err != nil {
// 		return errors.Wrap(err, "could not get categories for team to add channel")
// 	}
// 	for _, category := range categories.Categories {
// 		formattedCategoryName := strings.ToLower(strings.ReplaceAll(category.DisplayName, " ", "-"))
// 		if strings.Contains(strings.ToLower(channel.DisplayName), formattedCategoryName) {
// 			category.Channels = append(category.Channels, channel.Id)
// 			if _, err := s.pluginAPI.API.UpdateChannelSidebarCategories(params.UserID, params.TeamID, categories.Categories); err != nil {
// 				return errors.Wrap(err, "could not update categories for team to add channel")
// 			}
// 		}
// 	}
// 	return nil
// }

func (s *channelStore) getChannelsIdsBySectionID(sectionID string, tx *sqlx.Tx) ([]string, error) {
	channelsIdsSelect := s.store.builder.
		Select("ChannelID").
		From("CSA_Channel").
		Where(sq.Eq{"SectionID": sectionID})

	var channelsIds []string
	if err := s.store.selectBuilder(tx, &channelsIds, channelsIdsSelect); err != nil && err != sql.ErrNoRows {
		return nil, errors.Wrapf(err, "failed to get channels ids for section with id '%s'", sectionID)
	}
	return channelsIds, nil
}

func (s *channelStore) getChannelType(params app.AddChannelParams) model.ChannelType {
	channelType := model.ChannelTypePrivate
	if params.CreatePublicChannel {
		channelType = model.ChannelTypeOpen
	}
	return channelType
}

func (s *channelStore) toChannels(channelsEntities []ChannelEntity) []app.Channel {
	if channelsEntities == nil {
		return nil
	}
	channels := make([]app.Channel, 0, len(channelsEntities))
	for _, c := range channelsEntities {
		channels = append(channels, s.toChannel(c))
	}
	return channels
}

func (s *channelStore) toChannel(channelEntity ChannelEntity) app.Channel {
	channel := app.Channel{}
	err := util.Convert(channelEntity, &channel)
	if err != nil {
		return app.Channel{}
	}
	return channel
}
