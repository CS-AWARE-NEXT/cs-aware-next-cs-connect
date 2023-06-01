package api

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/app"
)

// ConfigHandler is the API handler.
type UserHandler struct {
	*ErrorHandler
	userService *app.UserService
}

// ConfigHandler returns a new platform config api handler
func NewUserHandler(router *mux.Router, userService *app.UserService) *UserHandler {
	handler := &UserHandler{
		ErrorHandler: &ErrorHandler{},
		userService:  userService,
	}

	usersRouter := router.PathPrefix("/users").Subrouter()
	usersRouter.HandleFunc("", withContext(handler.getAllUsers)).Methods(http.MethodGet)

	return handler
}

func (h *UserHandler) getAllUsers(c *Context, w http.ResponseWriter, r *http.Request) {
	teamID := r.URL.Query().Get("team_id")
	users, err := h.userService.GetAllUsers(teamID)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}
	ReturnJSON(w, users, http.StatusOK)
}
