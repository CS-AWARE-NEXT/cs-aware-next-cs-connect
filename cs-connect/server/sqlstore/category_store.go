package sqlstore

import (
	sq "github.com/Masterminds/squirrel"
	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/pkg/errors"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/app"
)

// A SQL store to interface the Mattermost sidebarcategories table
type categoryStore struct {
	pluginAPI    PluginAPIClient
	store        *SQLStore
	queryBuilder sq.StatementBuilderType
}

// This is a way to implement interface explicitly
var _ app.CategoryStore = (*categoryStore)(nil)

func NewCategoryStore(pluginAPI PluginAPIClient, sqlStore *SQLStore) app.CategoryStore {
	return &categoryStore{
		pluginAPI:    pluginAPI,
		store:        sqlStore,
		queryBuilder: sqlStore.builder,
	}
}

// The Mattermost RPC API lacks a method to delete categories. This is a temporary solution.
func (s *categoryStore) DeleteCategories(categories []*model.SidebarCategoryWithChannels) error {
	var ids []string
	for _, category := range categories {
		ids = append(ids, category.Id)
	}

	tx, err := s.store.db.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer s.store.finalizeTransaction(tx)

	if _, err := s.store.execBuilder(tx, s.queryBuilder.
		Delete("").
		From("sidebarcategories").
		Where(sq.Eq{"id": ids})); err != nil {
		return errors.Wrap(err, "could not delete categories")
	}
	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}

	return nil
}
