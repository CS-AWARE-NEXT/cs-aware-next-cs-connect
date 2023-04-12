package api

import (
	"net/http"

	"github.com/gorilla/mux"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/config"
)

const ConfigBasePath = "/configs"

// ConfigHandler is the API handler.
type ConfigHandler struct {
	*ErrorHandler
	platformService *config.PlatformService
}

// ConfigHandler returns a new platform config api handler
func NewConfigHandler(router *mux.Router, platformService *config.PlatformService) *ConfigHandler {
	handler := &ConfigHandler{
		ErrorHandler:    &ErrorHandler{},
		platformService: platformService,
	}

	platformRouter := router.PathPrefix(ConfigBasePath).Subrouter()
	platformRouter.HandleFunc("/platform", withContext(handler.getPlatformConfig)).Methods(http.MethodGet)

	return handler
}

func (h *ConfigHandler) getPlatformConfig(c *Context, w http.ResponseWriter, r *http.Request) {
	config, err := h.platformService.GetPlatformConfig()
	if err != nil {
		h.HandleError(w, c.logger, err)
		return
	}
	ReturnJSON(w, config, http.StatusOK)
}
