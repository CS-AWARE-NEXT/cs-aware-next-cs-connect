package config

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-server/v6/plugin"
)

type PlatformService struct {
	api                   plugin.API
	configFileName        string
	defaultConfigFileName string
}

// NewPlatformService returns a new platform config service
func NewPlatformService(api plugin.API, configFileName, defaultConfigFileName string) *PlatformService {
	return &PlatformService{
		api:                   api,
		configFileName:        configFileName,
		defaultConfigFileName: defaultConfigFileName,
	}
}

func (s *PlatformService) GetPlatformConfig() (*PlatformConfig, error) {
	if strings.TrimSpace(s.configFileName) == "" {
		s.api.LogInfo("Config file is not specified, falling back to default")
		s.configFileName = s.defaultConfigFileName
	}
	s.api.LogInfo("Loading config file", "name", s.configFileName)
	configFilePath := fmt.Sprintf("config/%s", s.configFileName)
	bundlePath, err := s.api.GetBundlePath()
	if err != nil {
		return nil, errors.Wrapf(err, "unable to get bundle path")
	}
	return getPlatformConfig(filepath.Join(bundlePath, configFilePath))
}
