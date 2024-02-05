package api

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/app"
)

// ChannelHandler is the API handler.
type ChannelHandler struct {
	*ErrorHandler
	channelService *app.ChannelService
}

// NewChannelHandler returns a new channels api handler
func NewChannelHandler(router *mux.Router, channelService *app.ChannelService) *ChannelHandler {
	handler := &ChannelHandler{
		ErrorHandler:   &ErrorHandler{},
		channelService: channelService,
	}

	channelsRouter := router.PathPrefix("/channels/{sectionId}").Subrouter()
	channelsRouter.HandleFunc("", withContext(handler.getChannels)).Methods(http.MethodGet)
	channelsRouter.HandleFunc("", withContext(handler.addChannel)).Methods(http.MethodPost)
	channelsRouter.HandleFunc("/archive_channels", withContext(handler.archiveChannels)).Methods(http.MethodPost)

	channelRouter := router.PathPrefix("/channel/{channelId}").Subrouter()
	channelRouter.HandleFunc("", withContext(handler.getChannelByID)).Methods(http.MethodGet)
	channelRouter.HandleFunc("/export", withContext(handler.exportChannel)).Methods(http.MethodPost)

	backlinksRouter := router.PathPrefix("/backlinks").Subrouter()
	backlinksRouter.HandleFunc("", withContext(handler.getBacklinks)).Methods(http.MethodGet)

	return handler
}

func (h *ChannelHandler) getChannels(c *Context, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sectionID := vars["sectionId"]
	parentID := r.URL.Query().Get("parent_id")
	channels, err := h.channelService.GetChannels(sectionID, parentID)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}
	ReturnJSON(w, channels, http.StatusOK)
}

func (h *ChannelHandler) getChannelByID(c *Context, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	channelID := vars["channelId"]
	channels, err := h.channelService.GetChannelByID(channelID)
	if err != nil {
		if errors.Is(err, app.ErrNotFound) {
			h.HandleErrorWithCode(w, c.logger, http.StatusNotFound, "channel not found", err)
		} else {
			h.HandleError(w, c.logger, err)
		}
		return
	}
	ReturnJSON(w, channels, http.StatusOK)
}

func (h *ChannelHandler) addChannel(c *Context, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sectionID := vars["sectionId"]
	var params app.AddChannelParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode channel to add", err)
		return
	}
	result, err := h.channelService.AddChannel(sectionID, params)
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}
	ReturnJSON(w, result, http.StatusOK)
}

func (h *ChannelHandler) archiveChannels(c *Context, w http.ResponseWriter, r *http.Request) {
	var params app.ArchiveChannelsParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode archive channels payload", err)
		return
	}
	if err := h.channelService.ArchiveChannels(params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to handle archive channels", err)
		return
	}
	ReturnJSON(w, "", http.StatusOK)
}

func (h *ChannelHandler) getBacklinks(c *Context, w http.ResponseWriter, r *http.Request) {
	elementURL := r.URL.Query().Get("elementUrl")
	userID := r.Header.Get("Mattermost-User-Id")
	backlinks, err := h.channelService.GetBacklinks(elementURL, userID)
	if err != nil {
		if errors.Is(err, app.ErrNotFound) {
			h.HandleErrorWithCode(w, c.logger, http.StatusNotFound, "channel not found", err)
		} else {
			h.HandleError(w, c.logger, err)
		}
		return
	}

	ReturnJSON(w, backlinks, http.StatusOK)
}

func (h *ChannelHandler) exportChannel(c *Context, w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	channelID := vars["channelId"]
	var params app.ExportChannelParams
	if err := json.NewDecoder(r.Body).Decode(&params); err != nil {
		h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "unable to decode export channel data", err)
		return
	}
	stixChannel, err := h.channelService.ExportChannel(channelID, params)
	if err != nil {
		if errors.Is(err, app.ErrNotFound) {
			h.HandleErrorWithCode(w, c.logger, http.StatusNotFound, "channel not found", err)
		} else {
			h.HandleError(w, c.logger, err)
		}
		return
	}

	var exporter app.Exporter
	if params.Format == "json" {
		exporter = &app.JSON{}
		exporter.Export(w, stixChannel)
		return
	}

	h.HandleErrorWithCode(w, c.logger, http.StatusBadRequest, "missing format", nil)
}
