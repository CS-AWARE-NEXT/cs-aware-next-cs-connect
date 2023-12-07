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
	platformRouter.HandleFunc("/set_organization", withContext(handler.setOrganization)).Methods(http.MethodPost)
	platformRouter.HandleFunc("/user_props", withContext(handler.getUserProps)).Methods(http.MethodGet)
	platformRouter.HandleFunc("/archive_issue_channels", withContext(handler.archiveIssueChannels)).Methods(http.MethodPost)

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

func (h *EventHandler) setOrganization(c *Context, w http.ResponseWriter, r *http.Request) {
	var params app.SetOrganizationParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode set organization payload", err)
		return
	}
	if err := h.eventService.SetOrganizations(params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to handle set organization", err)
		return
	}
	ReturnJSON(w, "", http.StatusOK)
}

func (h *EventHandler) getUserProps(c *Context, w http.ResponseWriter, r *http.Request) {
	var params app.GetUserPropsParams
	params.UserID = r.URL.Query().Get("userId")
	if params.UserID == "" {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "no userId provided", nil)
		return
	}
	userProps, err := h.eventService.GetUserProps(params)
	if err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to handle getUserProps", err)
		return
	}
	ReturnJSON(w, userProps, http.StatusOK)
}

func (h *EventHandler) archiveIssueChannels(c *Context, w http.ResponseWriter, r *http.Request) {
	var params app.ArchiveIssueChannelsParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode archive issue channels payload", err)
		return
	}
	if err := h.eventService.ArchiveIssueChannels(params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to handle archive issue channels", err)
		return
	}
	ReturnJSON(w, "", http.StatusOK)
}
