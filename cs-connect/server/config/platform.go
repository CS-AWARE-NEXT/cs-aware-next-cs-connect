package config

import (
	"io/ioutil"

	yaml "gopkg.in/yaml.v3"
)

// Marker ID to select all organizations, used when deciding which channels to show in the left sidebar
const OrganizationIDAll = "__all"

type PlatformConfig struct {
	EnvironmentConfig EnvironmentConfig `json:"environmentConfig" yaml:"environmentConfig"`
	Organizations     []Organization    `json:"organizations" yaml:"organizations"`
}

type EnvironmentConfig struct {
	ShowOptionsConfig ShowOptionsConfig `json:"showOptionsConfig" yaml:"showOptionsConfig"`
}

type ShowOptionsConfig struct {
	ShowAddChannelButton bool `json:"showAddChannelButton" yaml:"showAddChannelButton"`
	ShowUnreadIndicator  bool `json:"showUnreadIndicator" yaml:"showUnreadIndicator"`
	ShowDirectMessages   bool `json:"showDirectMessages" yaml:"showDirectMessages"`
	ShowDefaultChannels  bool `json:"showDefaultChannels" yaml:"showDefaultChannels"`
}

type Organization struct {
	IsEcosystem bool      `json:"isEcosystem" yaml:"isEcosystem"`
	Description string    `json:"description" yaml:"description"`
	ID          string    `json:"id" yaml:"id"`
	Name        string    `json:"name" yaml:"name"`
	Sections    []Section `json:"sections" yaml:"sections"`
	Widgets     []Widget  `json:"widgets" yaml:"widgets"`
}

type Section struct {
	ID       string    `json:"id" yaml:"id"`
	Internal bool      `json:"internal" yaml:"internal"`
	Name     string    `json:"name" yaml:"name"`
	URL      string    `json:"url" yaml:"url"`
	Sections []Section `json:"sections" yaml:"sections"`
	Widgets  []Widget  `json:"widgets" yaml:"widgets"`
}

type Widget struct {
	Name      string `json:"name" yaml:"name"`
	Type      string `json:"type" yaml:"type"`
	URL       string `json:"url" yaml:"url"`
	ChartType string `json:"chartType" yaml:"chartType"`
}

func getPlatformConfig(filepath string) (*PlatformConfig, error) {
	yamlFile, err := ioutil.ReadFile(filepath)
	if err != nil {
		return nil, err
	}
	config := &PlatformConfig{}
	if err = yaml.Unmarshal(yamlFile, config); err != nil {
		return nil, err
	}
	return config, nil
}

// Utility to get the ecosystem organization. We assume only one exists in the config channel.
func (p PlatformConfig) GetEcosystem() (*Organization, bool) {
	for _, organization := range p.Organizations {
		if organization.IsEcosystem {
			return &organization, true
		}
	}
	return nil, false
}
