package repository

import (
	"database/sql"
	"fmt"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config/db"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	sq "github.com/Masterminds/squirrel"
)

// PostRepository is a repository for posts stored in the
// Mattermost database in the posts table.
type PostRepository struct {
	db           *db.DB
	queryBuilder sq.StatementBuilderType
}

func NewPostRepository(db *db.DB) *PostRepository {
	return &PostRepository{
		db:           db,
		queryBuilder: db.Builder,
	}
}

func (r *PostRepository) GetPostByID(ID string) (model.Post, error) {
	postSelect := r.queryBuilder.
		Select("id, message, createat").
		From("posts").
		Where("id = ?", ID)
	var post model.Post
	err := r.db.GetBuilder(r.db.DB, &post, postSelect)
	if err != nil {
		if err == sql.ErrNoRows {
			return model.Post{}, fmt.Errorf("post with id %s not found", ID)
		}
		return model.Post{}, fmt.Errorf("error getting post: %w", err)
	}
	return post, nil
}
