package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/app"
)

// EventHandler is the API handler.
type EventHandler struct {
	*ErrorHandler
	eventService *app.EventService
}

// EventHandler returns a new event api handler
func NewEventHandler(router *mux.Router, eventService *app.EventService) *EventHandler {
	handler := &EventHandler{
		ErrorHandler: &ErrorHandler{},
		eventService: eventService,
	}

	platformRouter := router.PathPrefix("/events").Subrouter()
	platformRouter.HandleFunc("/user_added", withContext(handler.userAdded)).Methods(http.MethodPost)

	return handler
}

func (h *EventHandler) userAdded(c *Context, w http.ResponseWriter, r *http.Request) {
	var params app.UserAddedParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode user added payload", err)
		return
	}
	if err := h.eventService.UserAdded(params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to handle user added", err)
		return
	}
	ReturnJSON(w, "", http.StatusOK)
}
