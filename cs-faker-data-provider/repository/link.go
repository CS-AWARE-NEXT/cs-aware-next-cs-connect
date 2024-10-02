package repository

import (
	"encoding/json"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config/db"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	sq "github.com/Masterminds/squirrel"
	"github.com/pkg/errors"
)

type LinkRepository struct {
	db           *db.DB
	queryBuilder sq.StatementBuilderType
}

func NewLinkRepository(db *db.DB) *LinkRepository {
	return &LinkRepository{
		db:           db,
		queryBuilder: db.Builder,
	}
}

func (r *LinkRepository) GetLinksByOrganizationIDAndParentID(organizationID, parentID string) ([]model.Link, error) {
	var links []model.Link
	linksSelect := r.queryBuilder.Select("*").
		From("CSFDP_Links").
		Where(sq.Eq{"OrganizationID": organizationID, "ParentID": parentID})

	if err := r.db.SelectBuilder(r.db.DB, &links, linksSelect); err != nil {
		return nil, errors.Wrap(err, "could not get links")
	}
	return links, nil
}

func (r *LinkRepository) SaveLink(link model.Link) (model.Link, error) {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return model.Link{}, errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	var linkMap map[string]interface{}
	linkJson, _ := json.Marshal(link)
	json.Unmarshal(linkJson, &linkMap)
	linkMap["link"] = linkMap["to"]
	delete(linkMap, "to")

	if _, err := r.db.ExecBuilder(tx, sq.
		Insert("CSFDP_Links").
		SetMap(linkMap)); err != nil {
		return model.Link{}, errors.Wrap(err, "could not save link")
	}
	if err := tx.Commit(); err != nil {
		return model.Link{}, errors.Wrap(err, "could not commit transaction")
	}
	return link, nil
}
