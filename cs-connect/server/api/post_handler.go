package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/app"
)

// PostHandler is the API handler.
type PostHandler struct {
	*ErrorHandler
	postService *app.PostService
}

// NewPostHandler returns a new posts api handler
func NewPostHandler(router *mux.Router, postService *app.PostService) *PostHandler {
	handler := &PostHandler{
		ErrorHandler: &ErrorHandler{},
		postService:  postService,
	}

	channelsRouter := router.PathPrefix("/posts").Subrouter()
	channelsRouter.HandleFunc("", withContext(handler.getPostsByIds)).Methods(http.MethodPost)

	return handler
}

func (h *PostHandler) getPostsByIds(c *Context, w http.ResponseWriter, r *http.Request) {
	var params app.PostsByIdsParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode post ids to convert", err)
		return
	}
	posts, err := h.postService.GetPostsByIds(params)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}
	ReturnJSON(w, posts, http.StatusOK)
}
