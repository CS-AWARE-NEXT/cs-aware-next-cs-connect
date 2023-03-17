package user

import (
	"github.com/mattermost/mattermost-server/v6/plugin"
)

func GetUserIDByUserRequestID(api plugin.API, id string) (string, error) {
	api.LogInfo("Getting id for user", "request.UserId", id)
	user, err := api.GetUser(id)
	if err != nil {
		api.LogError("Failed to get user for command", "err", err.Error())
		return "", err
	}
	return user.Id, nil
}
