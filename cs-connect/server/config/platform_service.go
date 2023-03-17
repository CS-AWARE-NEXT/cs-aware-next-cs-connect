package config

import (
	"path/filepath"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-server/v6/plugin"
)

type PlatformService struct {
	api plugin.API
}

// NewPlatformService returns a new platform config service
func NewPlatformService(api plugin.API) *PlatformService {
	return &PlatformService{
		api: api,
	}
}

func (s *PlatformService) GetPlatformConfig() (*PlatformConfig, error) {
	bundlePath, err := s.api.GetBundlePath()
	if err != nil {
		return nil, errors.Wrapf(err, "unable to get bundle path")
	}
	return getPlatformConfig(filepath.Join(bundlePath, "config/config.yml"))
}
