package main

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/mattermost/mattermost-server/v6/model"

	"github.com/tizianocitro/csa-connect/server/command"
	"github.com/tizianocitro/csa-connect/server/user"
)

func (p *Plugin) handleGetOrganizationURL(w http.ResponseWriter, r *http.Request) {
	serverConfig := p.API.GetConfig()
	request, err := p.getDialogRequestFromBody(r)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	userID, err := p.getUserIDByUserRequestID(request)
	if err != nil {
		w.WriteHeader(http.StatusOK)
		return
	}

	if p.isRequestCanceled(request) {
		return
	}

	if err := command.CreateGetOrganizationURLPost(&command.OrganizationURLPostConfig{
		UserID: userID,
		PluginConfig: command.PluginConfig{
			PathPrefix: p.pluginURLPathPrefix,
			PluginID:   p.pluginID,
			SiteURL:    *serverConfig.ServiceSettings.SiteURL,
			PluginAPI: command.PluginAPI{
				API: p.API,
			},
		},
	}, request); err != nil {
		w.WriteHeader(http.StatusOK)
		return
	}

	p.completeRequest(w)
}

func (p *Plugin) getDialogRequestFromBody(r *http.Request) (*model.SubmitDialogRequest, error) {
	request := &model.SubmitDialogRequest{}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		p.API.LogError("Failed to read body from request", "request", r)
		return nil, err
	}
	if err = json.Unmarshal(body, request); err != nil {
		p.API.LogError("Failed to unmarshal body", "body", body, "request", r)
		return nil, err
	}
	return request, nil
}

func (p *Plugin) getUserIDByUserRequestID(request *model.SubmitDialogRequest) (string, error) {
	p.API.LogInfo("Getting user id from request", "requestUserId", request.UserId)
	userID, err := user.GetUserIDByUserRequestID(p.API, request.UserId)
	if err != nil {
		return "", err
	}
	return userID, nil
}

func (p *Plugin) isRequestCanceled(request *model.SubmitDialogRequest) bool {
	p.API.LogInfo("Checking if request was canceled")
	if request.Cancelled {
		p.API.LogInfo("Request was canceled")
		return true
	}
	return false
}

func (p *Plugin) completeRequest(w http.ResponseWriter) {
	p.API.LogInfo("Completed request")
	w.WriteHeader(http.StatusOK)
}
