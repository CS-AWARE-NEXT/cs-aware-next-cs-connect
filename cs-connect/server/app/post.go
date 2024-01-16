package app

type Post struct {
	ID      string `json:"id"`
	Message string `json:"message"`
}

type PostsByIdsParams struct {
	PostIds []string `json:"postIds"`
}

type GetPostsByIdsResult struct {
	Posts []Post `json:"posts"`
}
