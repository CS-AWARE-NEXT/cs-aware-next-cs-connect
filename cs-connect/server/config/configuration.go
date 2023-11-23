package config

import (
	"sync"

	"github.com/mattermost/mattermost-server/v6/plugin"
)

type MattermostConfig struct {
	api               plugin.API
	configurationLock sync.RWMutex
	configuration     *Configuration
}

func NewMattermostConfig(api plugin.API) *MattermostConfig {
	return &MattermostConfig{
		api: api,
	}
}

type Configuration struct {
	AdminPassword string
}

func (c *Configuration) Clone() *Configuration {
	var clone = *c
	return &clone
}

func (p *MattermostConfig) GetConfiguration() *Configuration {
	p.configurationLock.RLock()
	defer p.configurationLock.RUnlock()

	if p.configuration == nil {
		return &Configuration{}
	}

	return p.configuration
}

func (p *MattermostConfig) SetConfiguration(configuration *Configuration) {
	p.configurationLock.Lock()
	defer p.configurationLock.Unlock()

	if configuration != nil && p.configuration == configuration {
		return
	}

	p.configuration = configuration
}
