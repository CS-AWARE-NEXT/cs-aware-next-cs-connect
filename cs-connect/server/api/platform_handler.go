package api

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/config"
)

// PlatformHandler is the API handler.
type PlatformHandler struct {
	*ErrorHandler
	platformService *config.PlatformService
}

// PlatformHandler returns a new platform config api handler
func NewPlatformHandler(router *mux.Router, platformService *config.PlatformService) *PlatformHandler {
	handler := &PlatformHandler{
		ErrorHandler:    &ErrorHandler{},
		platformService: platformService,
	}

	platformRouter := router.PathPrefix("/configs").Subrouter()
	platformRouter.HandleFunc("/platform", withContext(handler.getPlatformConfig)).Methods(http.MethodGet)

	return handler
}

func (h *PlatformHandler) getPlatformConfig(c *Context, w http.ResponseWriter, r *http.Request) {
	config, err := h.platformService.GetPlatformConfig()
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}
	ReturnJSON(w, config, http.StatusOK)
}
