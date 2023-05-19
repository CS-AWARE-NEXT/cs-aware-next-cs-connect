package app

import (
	"github.com/mattermost/mattermost-server/v6/plugin"
)

type UserService struct {
	api plugin.API
}

// NewPlatformService returns a new platform config service
func NewUserService(api plugin.API) *UserService {
	return &UserService{
		api: api,
	}
}

func (s *UserService) GetAllUsers(teamID string) ([]UserRule, error) {
	users, err := s.api.GetUsersInTeam(teamID, 0, 200)
	if err != nil {
		return nil, err
	}
	userRules := []UserRule{}
	for _, user := range users {
		userRules = append(userRules, UserRule{
			UserID:    user.Id,
			Username:  user.Username,
			FirstName: user.FirstName,
			LastName:  user.LastName,
		})
	}
	return userRules, nil
}

func GetUserIDByUserRequestID(api plugin.API, id string) (string, error) {
	api.LogInfo("Getting id for user", "request.UserId", id)
	user, err := api.GetUser(id)
	if err != nil {
		api.LogError("Failed to get user for command", "err", err.Error())
		return "", err
	}
	return user.Id, nil
}
