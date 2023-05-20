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

func (s *UserService) GetAllUsers(teamID string) (UserResult, error) {
	users, err := s.api.GetUsersInTeam(teamID, 0, 200)
	if err != nil {
		return UserResult{}, err
	}
	result := []User{}
	for _, user := range users {
		result = append(result, User{
			UserID:    user.Id,
			Username:  user.Username,
			FirstName: user.FirstName,
			LastName:  user.LastName,
		})
	}
	return UserResult{
		Users: result,
	}, nil
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
