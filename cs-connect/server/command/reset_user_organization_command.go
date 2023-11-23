package command

import (
	"encoding/base64"
	"fmt"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/config"

	"github.com/mattermost/mattermost-server/v6/model"
)

const (
	resetUserOrganizationDisplayName       = "ResetUserOrganization"
	ResetUserOrganizationCommandName       = "reset_user_organization"
	resetUserOrganizationCallback          = "handleResetUserOrganization"
	resetUserOrganizationNotifyOnCancel    = true
	resetUserOrganizationState             = ""
	resetUserOrganizationSubmitLabel       = "Confirm"
	resetUserOrganizationDesc              = "Reset the organization associated to an user."
	resetUserOrganizationAutoComplete      = true
	ResetUserOrganizationPath              = "/" + resetUserOrganizationEndpoint
	resetUserOrganizationEndpoint          = "reset_user_organization"
	resetUserOrganizationUserFieldName     = "user_field"
	resetUserOrganizationPasswordFieldName = "password_field"
)

type ResetUserOrganizationDialogConfig struct {
	PluginConfig
	Args *model.CommandArgs
}

type ResetUserOrganizationConfig struct {
	PluginConfig
	UserID string
}

func ResetUserOrganizationCommand() *model.Command {
	return &model.Command{
		AutoComplete:     resetUserOrganizationAutoComplete,
		AutoCompleteDesc: resetUserOrganizationDesc,
		DisplayName:      resetUserOrganizationDisplayName,
		Trigger:          ResetUserOrganizationCommandName,
	}
}

func OpenDialogResetUserOrganizationRequest(config *ResetUserOrganizationDialogConfig) *model.CommandResponse {
	API := config.API
	openDialogRequest := model.OpenDialogRequest{
		Dialog:    resetUserOrganizationDialog(),
		TriggerId: config.Args.TriggerId,
		URL:       fmt.Sprintf("%s/%s/%s/%s", config.SiteURL, config.PathPrefix, config.PluginID, resetUserOrganizationEndpoint),
	}
	if err := API.OpenInteractiveDialog(openDialogRequest); err != nil {
		errorMessage := fmt.Sprintf("Failed to open the interactive dialog for %s command", ResetUserOrganizationCommandName)
		API.LogError(errorMessage, "err", err.Error())
		return &model.CommandResponse{
			ResponseType: model.CommandResponseTypeEphemeral,
			Text:         errorMessage,
		}
	}
	return &model.CommandResponse{}
}

func resetUserOrganizationDialog() model.Dialog {
	return model.Dialog{
		CallbackId:     resetUserOrganizationCallback,
		Elements:       resetUserOrganizationDialogElements(),
		IconURL:        "http://www.mattermost.org/wp-content/uploads/2016/04/icon.png",
		NotifyOnCancel: resetUserOrganizationNotifyOnCancel,
		State:          resetUserOrganizationState,
		SubmitLabel:    resetUserOrganizationSubmitLabel,
		Title:          resetUserOrganizationDesc,
	}
}

func resetUserOrganizationDialogElements() []model.DialogElement {
	return []model.DialogElement{{
		DisplayName: "User Selector",
		Name:        resetUserOrganizationUserFieldName,
		Type:        "select",
		Placeholder: "Select a user.",
		HelpText:    "Choose a user from the list.",
		DataSource:  "users",
	}, {
		DisplayName: "Admin password",
		Name:        resetUserOrganizationPasswordFieldName,
		Type:        "text",
		SubType:     "password",
		Placeholder: "Password",
		HelpText:    "Enter the administrator password.",
	}}
}

func ResetUserOrganization(pluginConfig *ResetUserOrganizationConfig, config *config.MattermostConfig, request *model.SubmitDialogRequest) error {
	userID, ok := request.Submission[resetUserOrganizationUserFieldName].(string)

	if !ok {
		return fmt.Errorf("request is missing field %s", resetUserOrganizationUserFieldName)
	}

	password, ok := request.Submission[resetUserOrganizationPasswordFieldName].(string)
	if !ok {
		return fmt.Errorf("request is missing field %s", resetUserOrganizationPasswordFieldName)
	}
	pluginConfig.API.LogInfo("checking pw", "pw", password, "adminpw", config.GetConfiguration().AdminPassword)

	if password == "" || base64.StdEncoding.EncodeToString([]byte(password)) != config.GetConfiguration().AdminPassword {
		return fmt.Errorf("wrong password")
	}

	user, err := pluginConfig.API.GetUser(userID)
	if err != nil {
		return fmt.Errorf("something went wrong with userid %s", userID)
	}
	user.SetProp("orgId", "")
	if _, err := pluginConfig.API.UpdateUser(user); err != nil {
		return fmt.Errorf("couldn't update user props")
	}

	pluginConfig.API.SendEphemeralPost(pluginConfig.UserID, &model.Post{
		Message:   fmt.Sprintf("Organization reset for the user %s successful.", user.Username),
		ChannelId: request.ChannelId,
	})
	return nil
}
