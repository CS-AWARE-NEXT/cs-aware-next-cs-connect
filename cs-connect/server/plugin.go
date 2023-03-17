package main

import (
	"net/http"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	"github.com/mattermost/mattermost-plugin-api/cluster"
	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"

	pluginapi "github.com/mattermost/mattermost-plugin-api"

	"github.com/tizianocitro/csa-connect/server/api"
	"github.com/tizianocitro/csa-connect/server/app"
	"github.com/tizianocitro/csa-connect/server/command"
	"github.com/tizianocitro/csa-connect/server/config"
	"github.com/tizianocitro/csa-connect/server/sqlstore"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// BotId of the created bot account
	botID string

	handler *api.Handler

	plaformConfig *config.PlatformConfig

	pluginAPI *pluginapi.Client

	// Plugin's id read from the manifest file
	pluginID string

	// How the plugin URLs starts
	pluginURLPathPrefix string

	channelService  *app.ChannelService
	platformService *config.PlatformService
}

func (p *Plugin) OnActivate() error {
	p.pluginAPI = pluginapi.NewClient(p.API, p.Driver)

	logger := logrus.StandardLogger()
	pluginapi.ConfigureLogrus(logger, p.pluginAPI)

	p.pluginID = p.getPluginIDFromManifest()
	p.pluginURLPathPrefix = p.getPluginURLPathPrefix()
	botID, err := p.getBotID()
	if err != nil {
		return err
	}
	p.botID = botID

	apiClient := sqlstore.NewClient(p.pluginAPI, p.API)
	sqlStore, err := sqlstore.New(apiClient)
	if err != nil {
		return errors.Wrapf(err, "failed creating the SQL store")
	}
	channelStore := sqlstore.NewChannelStore(apiClient, sqlStore)

	p.channelService = app.NewChannelService(p.API, channelStore)
	p.platformService = config.NewPlatformService(p.API)

	mutex, err := cluster.NewMutex(p.API, "CSA_dbMutex")
	if err != nil {
		return errors.Wrapf(err, "failed creating cluster mutex")
	}
	mutex.Lock()
	if err = sqlStore.RunMigrations(); err != nil {
		mutex.Unlock()
		return errors.Wrapf(err, "failed to run migrations")
	}
	mutex.Unlock()

	p.handler = api.NewHandler(p.pluginAPI)
	api.NewChannelHandler(
		p.handler.APIRouter,
		p.channelService,
	)
	api.NewPlatformHandler(
		p.handler.APIRouter,
		p.platformService,
	)

	// if err := p.registerCommands(); err != nil {
	// 	return errors.Wrapf(err, "failed to register commands")
	// }

	p.API.LogInfo("Plugin activated successfully", "pluginID", p.pluginID, "botID", p.botID)
	return nil
}

// See more on https://developers.mattermost.com/extend/plugins/server/reference/
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case command.GetOrganizationURLPath:
		p.handleGetOrganizationURL(w, r)
	default:
		p.handler.ServeHTTP(w, r)
	}
}

func (p *Plugin) getPluginIDFromManifest() string {
	return manifest.Id
}

func (p *Plugin) getPluginURLPathPrefix() string {
	return DefaultPath
}

func (p *Plugin) getBotID() (string, error) {
	botID, err := p.pluginAPI.Bot.EnsureBot(&model.Bot{
		Username:    "csawareconnect",
		DisplayName: "CS-AWARE CONNECT Bot",
		Description: "A bot account created by the CS-AWARE CONNECT product.",
	})
	if err != nil {
		return "", errors.Wrap(err, "failed to ensure bot, so cannot get botID")
	}
	return botID, nil
}
