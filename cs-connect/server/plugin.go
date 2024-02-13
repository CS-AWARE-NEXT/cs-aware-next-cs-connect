package main

import (
	"net/http"

	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"

	"github.com/mattermost/mattermost-plugin-api/cluster"
	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"

	pluginapi "github.com/mattermost/mattermost-plugin-api"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/api"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/app"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/command"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/config"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/sqlstore"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	configuration *config.MattermostConfig

	// BotId of the created bot account
	botID string

	handler *api.Handler

	plaformConfig *config.PlatformConfig

	pluginAPI *pluginapi.Client

	// Plugin's id read from the manifest file
	pluginID string

	// How the plugin URLs starts
	pluginURLPathPrefix string

	platformService *config.PlatformService
	categoryService *app.CategoryService
	channelService  *app.ChannelService
	postService     *app.PostService
	eventService    *app.EventService
	userService     *app.UserService
}

func (p *Plugin) OnActivate() error {
	p.pluginAPI = pluginapi.NewClient(p.API, p.Driver)
	// configuration is initialized in OnConfigurationChange, which runs before OnActivate.

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
	categoryStore := sqlstore.NewCategoryStore(apiClient, sqlStore)
	mattermostChannelStore := sqlstore.NewMattermostChannelStore(apiClient, sqlStore)

	p.platformService = config.NewPlatformService(p.API, configFileName, defaultConfigFileName)
	p.categoryService = app.NewCategoryService(p.API, p.platformService, channelStore, categoryStore, mattermostChannelStore)
	p.channelService = app.NewChannelService(p.API, channelStore, mattermostChannelStore, p.categoryService, p.platformService)
	p.postService = app.NewPostService(p.API, p.channelService)
	p.eventService = app.NewEventService(p.API, p.platformService, p.channelService, p.categoryService, p.botID, p.configuration)
	p.userService = app.NewUserService(p.API)

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
	api.NewConfigHandler(
		p.handler.APIRouter,
		p.platformService,
	)
	api.NewChannelHandler(
		p.handler.APIRouter,
		p.channelService,
	)
	api.NewPostHandler(
		p.handler.APIRouter,
		p.postService,
	)
	api.NewEventHandler(
		p.handler.APIRouter,
		p.eventService,
	)
	api.NewUserHandler(
		p.handler.APIRouter,
		p.userService,
	)

	if err := p.registerCommands(); err != nil {
		return errors.Wrapf(err, "failed to register commands")
	}

	p.API.LogInfo("Plugin activated successfully", "pluginID", p.pluginID, "botID", p.botID)
	return nil
}

// func (p *Plugin) WebSocketMessageHasBeenPosted(webConnID, userID string, req *model.WebSocketRequest) {
// 	p.API.LogInfo("Received an event", "req", req, "userId", userID)
// 	p.API.LogInfo("Completed event processing", "req", req, "userId", userID)
// }

// See more on https://developers.mattermost.com/extend/plugins/server/reference/
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case command.GetOrganizationURLPath:
		p.handleGetOrganizationURL(w, r)
	case command.ResetUserOrganizationPath:
		p.handleResetUserOrganization(w, r)
	default:
		p.handler.ServeHTTP(w, r)
	}
}

func (p *Plugin) MessageWillBeUpdated(c *plugin.Context, newPost, oldPost *model.Post) (*model.Post, string) {
	// p.API.LogInfo("MessageWillBeUpdated hook", "OldPost", oldPost, "NewPost", newPost)
	return newPost, ""
}

func (p *Plugin) MessageHasBeenPosted(c *plugin.Context, post *model.Post) {
	p.API.LogInfo("MessageHasBeenPosted", "post", post)
	p.channelService.AddBacklinkIfPresent(post)
}

func (p *Plugin) getPluginIDFromManifest() string {
	return manifest.Id
}

func (p *Plugin) getPluginURLPathPrefix() string {
	return defaultPath
}

func (p *Plugin) getBotID() (string, error) {
	botID, err := p.pluginAPI.Bot.EnsureBot(&model.Bot{
		Username:    botUsername,
		DisplayName: botName,
		Description: botDescription,
	})
	if err != nil {
		return "", errors.Wrap(err, "failed to ensure bot, so cannot get botID")
	}
	return botID, nil
}

// OnConfigurationChange is invoked when configuration changes may have been made.
func (p *Plugin) OnConfigurationChange() error {
	// This hook runs before OnActivate, so this initialization must go here.
	if p.configuration == nil {
		p.configuration = config.NewMattermostConfig(p.API)
	}
	var configuration = new(config.Configuration)

	// Load the public configuration fields from the Mattermost server configuration.
	if err := p.API.LoadPluginConfiguration(configuration); err != nil {
		return errors.Wrap(err, "failed to load plugin configuration")
	}

	p.configuration.SetConfiguration(configuration)

	return nil
}
