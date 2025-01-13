package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/gofiber/fiber/v2/log"
)

type ChannelExporter interface {
	ExportChannel(
		channel model.STIXChannel,
		vars map[string]string,
	) (model.STIXChannel, error)
}

type JSONChannelExporter struct {
	ecosystemId string
	endpoint    string
	authService *AuthService
}

// This is a way to implement interface explicitly
var _ ChannelExporter = (*JSONChannelExporter)(nil)

func NewJSONChannelExporter(
	ecosystemId string,
	endpoint string,
	authService *AuthService,
) *JSONChannelExporter {
	return &JSONChannelExporter{
		ecosystemId: ecosystemId,
		endpoint:    endpoint,
		authService: authService,
	}
}

func (ce *JSONChannelExporter) ExportChannel(
	channel model.STIXChannel,
	vars map[string]string,
) (model.STIXChannel, error) {
	log.Infof("Exporting channel %s", channel.Name)
	if channel.ObjectRefs == nil {
		channel.ObjectRefs = make([]*model.STIXPost, 0)
	}

	log.Info("Creating request")
	body, err := json.Marshal(channel)
	if err != nil {
		log.Error("error creating body ", err.Error())
		return model.STIXChannel{}, err
	}
	log.Infof("Exporting channel -----> %s", string(body))

	endpoint := strings.Replace(ce.endpoint, "{ecosystem_id}", ce.ecosystemId, 1)
	log.Infof("Endpoint for channel export: %s", endpoint)
	req, err := http.NewRequest(
		"PUT",
		endpoint,
		bytes.NewBuffer(body),
	)
	if err != nil {
		log.Error("error creating request ", err.Error())
		return model.STIXChannel{}, err
	}
	req.Header.Set("Content-Type", "application/json")

	log.Info("Authenticating to get token")
	authResp, err := ce.authService.Auth(vars["authUsername"], vars["authPassword"])
	if err != nil {
		log.Error("error authenticating ", err.Error())
		return model.STIXChannel{}, err
	}
	log.Infof("Got token: %s", authResp.String())
	req.Header.Set("access-token", authResp.AccessToken)
	req.Header.Set("id-token", authResp.IdToken)

	transport := &http.Transport{}
	client := &http.Client{Transport: transport}

	resp, err := client.Do(req)
	if err != nil {
		log.Error("error exporting channel ", err.Error())
		return model.STIXChannel{}, err
	}
	defer resp.Body.Close()
	defer transport.CloseIdleConnections()

	log.Info("Response Status: ", resp.Status)
	log.Info("Response Headers: ", resp.Header)
	if resp.StatusCode != http.StatusOK {
		log.Error("error exporting channel on status check ", resp.Status)
		return model.STIXChannel{}, errors.New("external server returned error when trying to export channel")
	}
	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Error("error reading response body ", string(respBody), err.Error())
		return model.STIXChannel{}, err
	}
	log.Info("Response Body: ", string(respBody))

	log.Infof("Exported channel %s", channel.Name)

	return channel, nil
}
