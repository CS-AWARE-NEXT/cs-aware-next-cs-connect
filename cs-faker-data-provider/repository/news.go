package repository

import (
	"encoding/json"
	"fmt"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config/db"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	sq "github.com/Masterminds/squirrel"
	"github.com/pkg/errors"
)

type NewsRepository struct {
	db           *db.DB
	queryBuilder sq.StatementBuilderType
}

func NewNewsRepository(db *db.DB) *NewsRepository {
	return &NewsRepository{
		db:           db,
		queryBuilder: db.Builder,
	}
}

func (r *NewsRepository) GetNewsByOrganizationID(organizationID string) ([]model.NewsEntity, error) {
	var news []model.NewsEntity
	newsSelect := r.queryBuilder.Select("*").
		From("CSFDP_News").
		Where(sq.Eq{"OrganizationID": organizationID})

	if err := r.db.SelectBuilder(r.db.DB, &news, newsSelect); err != nil {
		return nil, errors.Wrap(err, "could not get news")
	}
	return news, nil
}

func (r *NewsRepository) GetNewsByID(newsID string) (model.NewsEntity, error) {
	var news model.NewsEntity
	newsSelect := r.queryBuilder.Select("*").
		From("CSFDP_News").
		Where(sq.Eq{"ID": newsID})

	if err := r.db.GetBuilder(r.db.DB, &news, newsSelect); err != nil {
		return model.NewsEntity{}, errors.Wrap(err, "could not get news by ID")
	}
	return news, nil
}

func (r *NewsRepository) SaveNews(news model.NewsEntity) (model.NewsEntity, error) {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return model.NewsEntity{}, errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	var newsMap map[string]interface{}
	newsJson, _ := json.Marshal(news)
	json.Unmarshal(newsJson, &newsMap)

	if _, err := r.db.ExecBuilder(tx, sq.
		Insert("CSFDP_News").
		SetMap(newsMap)); err != nil {
		return model.NewsEntity{}, errors.Wrap(err, "could not save news entity")
	}
	if err := tx.Commit(); err != nil {
		return model.NewsEntity{}, errors.Wrap(err, "could not commit transaction")
	}
	return news, nil
}

func (r *NewsRepository) DeleteNewsByID(id string) error {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	if _, err := r.db.ExecBuilder(tx, sq.
		Delete("CSFDP_News").
		Where(sq.Eq{"ID": id})); err != nil {
		return errors.Wrap(err, fmt.Sprintf("could not delete news with id %s", id))
	}
	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}
	return nil
}
