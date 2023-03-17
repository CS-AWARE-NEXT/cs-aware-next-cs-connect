package api

import (
	"encoding/json"
	"net/http"

	"github.com/sirupsen/logrus"

	"github.com/gorilla/mux"

	pluginapi "github.com/mattermost/mattermost-plugin-api"
)

const MaxRequestSize = 5 * 1024 * 1024 // 5MB

// Handler Root API handler.
type Handler struct {
	*ErrorHandler
	APIRouter *mux.Router
	pluginAPI *pluginapi.Client
	root      *mux.Router
}

// NewHandler constructs a new handler.
func NewHandler(pluginAPI *pluginapi.Client) *Handler {
	root := mux.NewRouter()
	api := root.PathPrefix("/api/v0").Subrouter()
	api.Use(MattermostAuthorizationRequired)
	api.Use(LogRequest)

	api.Handle("{anything:.*}", http.NotFoundHandler())
	api.NotFoundHandler = http.NotFoundHandler()

	return &Handler{
		ErrorHandler: &ErrorHandler{},
		APIRouter:    api,
		pluginAPI:    pluginAPI,
		root:         root,
	}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, MaxRequestSize)
	h.root.ServeHTTP(w, r)
}

// ReturnJSON writes the given pointerToObject as json with the provided httpStatus
func ReturnJSON(w http.ResponseWriter, pointerToObject interface{}, httpStatus int) {
	jsonBytes, err := json.Marshal(pointerToObject)
	if err != nil {
		logrus.WithError(err).Error("Unable to marshal JSON")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpStatus)

	if _, err = w.Write(jsonBytes); err != nil {
		logrus.WithError(err).Warn("Unable to write to http.ResponseWriter")
		return
	}
}

// HandleErrorWithCode logs the internal error and sends the public facing error
// message as JSON in a response with the provided code.
func HandleErrorWithCode(logger logrus.FieldLogger, w http.ResponseWriter, code int, publicErrorMsg string, internalErr error) {
	if internalErr != nil {
		logger = logger.WithError(internalErr)
	}
	if code >= http.StatusInternalServerError {
		logger.Error(publicErrorMsg)
	} else {
		logger.Warn(publicErrorMsg)
	}
	handleResponseWithCode(w, code, publicErrorMsg)
}

// handleResponseWithCode logs the internal error and sends the public facing error
// message as JSON in a response with the provided code.
func handleResponseWithCode(w http.ResponseWriter, code int, publicMsg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	responseMsg, _ := json.Marshal(struct {
		Error string `json:"error"` // A public facing message providing details about the error.
	}{
		Error: publicMsg,
	})
	_, _ = w.Write(responseMsg)
}
