package sqlstore

import (
	"database/sql"

	pluginapi "github.com/mattermost/mattermost-plugin-api"

	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
)

// StoreAPI is the interface exposing the underlying database, provided by pluginapi
// It is implemented by mattermost-plugin-api/Client.Store, or by the mock StoreAPI.
type StoreAPI interface {
	GetMasterDB() (*sql.DB, error)
	DriverName() string
}

// KVAPI is the key value store interface for the pluginkv stores.
// It is implemented by mattermost-plugin-api/Client.KV, or by the mock KVAPI.
type KVAPI interface {
	Get(key string, out interface{}) error
}

type ConfigurationAPI interface {
	GetConfig() *model.Config
}

// PluginAPIClient is the struct combining the interfaces defined above, which is everything
// from pluginapi that the store currently uses.
type PluginAPIClient struct {
	API           plugin.API
	Configuration ConfigurationAPI
	KV            KVAPI
	Store         StoreAPI
}

// NewClient receives a pluginapi.Client and returns the PluginAPIClient, which is what the
// store will use to access pluginapi.Client.
func NewClient(api *pluginapi.Client, pluginAPI plugin.API) PluginAPIClient {
	return PluginAPIClient{
		API:           pluginAPI,
		Configuration: &api.Configuration,
		KV:            &api.KV,
		Store:         api.Store,
	}
}
