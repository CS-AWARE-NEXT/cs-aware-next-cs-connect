package repository

import (
	"database/sql"
	"fmt"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config/db"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	sq "github.com/Masterminds/squirrel"
	"github.com/gofiber/fiber/v2/log"
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
			log.Infof("post with id %s not found", ID)
			return model.Post{}, fmt.Errorf("post with id %s not found", ID)
		}
		log.Infof("post with id %s resulted into error %s", ID, err.Error())
		return model.Post{}, fmt.Errorf("error getting post: %w", err)
	}
	log.Infof("found post with id %s -----> %s", ID, post.Message)
	return post, nil
}
