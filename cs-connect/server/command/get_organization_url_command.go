package command

import (
	"fmt"
	"strings"

	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
)

const (
	GetOrganizationURLCommandName = "organization"
	GetOrganizationURLPath        = "/" + getOrganizationURLEndpoint

	getOrganizationURLDesc              = "Get a organization URL given the organization name."
	getOrganizationURLDialogCommand     = "dialog"
	getOrganizationURLDialogCommandDesc = "Open a dialog to select a organization name."
	getOrganizationURLEndpoint          = "get_organization_url"
	getOrganizationURLHelpCommand       = "help"
	getOrganizationURLHelpCommandDesc   = "Get help on how to use the command."
	getOrganizationURLNameCommand       = "name"
	getOrganizationURLNameCommandDesc   = "The organization name."
)

const (
	getOrganizationURLAutoComplete   = true
	getOrganizationURLCallback       = "handleGetOrganizationURL"
	getOrganizationURLDisplayName    = "GetOrganizationUrl"
	getOrganizationURLNotifyOnCancel = true
	getOrganizationURLState          = ""
	getOrganizationURLSubmitLabel    = "Confirm"
)

const (
	emptyOrganizationNameResponse = "A name is required."
	helpResponse                  = "###### " + getOrganizationURLDesc + "\n" +
		"- `/dialog` - " + getOrganizationURLDialogCommandDesc + "\n" +
		"- `/name` - Get the URL of the organization with the name equals to the provided [name].\n" +
		"- `/help` - Show this help text."
)

const organizationSelectorFieldName = "organizationSelector"

type PluginAPI struct {
	API plugin.API
}

type PluginConfig struct {
	PluginAPI
	PathPrefix string
	PluginID   string
	SiteURL    string
}

type OrganizationURLConfig struct {
	PluginConfig
	Name string
}

type OrganizationURLDialogConfig struct {
	PluginConfig
	Args *model.CommandArgs
}

type OrganizationURLPostConfig struct {
	PluginConfig
	UserID string
}

type OrganizationURLMarkdownConfig struct {
	PluginConfig
	ID   string
	Name string
}

func GetOrganizationURLCommand() *model.Command {
	return &model.Command{
		AutoComplete:     getOrganizationURLAutoComplete,
		AutocompleteData: getGetOrganizationURLAutocompleteData(),
		AutoCompleteDesc: getOrganizationURLDesc,
		DisplayName:      getOrganizationURLDisplayName,
		Trigger:          GetOrganizationURLCommandName,
	}
}

func HelpGetOrganizationURLResponse() *model.CommandResponse {
	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         helpResponse,
	}
}

func EmptyNameGetOrganizationURLResponse() *model.CommandResponse {
	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeEphemeral,
		Text:         emptyOrganizationNameResponse,
	}
}

func GetOrganizationURLResponse(config *OrganizationURLConfig) *model.CommandResponse {
	return &model.CommandResponse{
		ResponseType: model.CommandResponseTypeInChannel,
		Text:         getOrganizationURL(config),
	}
}

func OpenDialogGetOrganizationURLRequest(config *OrganizationURLDialogConfig) *model.CommandResponse {
	API := config.API
	API.LogInfo("Creating request to open dialog", "config", config)
	openDialogRequest := model.OpenDialogRequest{
		Dialog:    getOrganizationURLDialog(),
		TriggerId: config.Args.TriggerId,
		URL:       fmt.Sprintf("%s/%s/%s/%s", config.SiteURL, config.PathPrefix, config.PluginID, getOrganizationURLEndpoint),
	}
	API.LogInfo("Opening dialog", "request", openDialogRequest, "config", config)
	if err := API.OpenInteractiveDialog(openDialogRequest); err != nil {
		errorMessage := fmt.Sprintf("Failed to open the interactive dialog for %s command", GetOrganizationURLCommandName)
		API.LogError(errorMessage, "err", err.Error())
		return &model.CommandResponse{
			ResponseType: model.CommandResponseTypeEphemeral,
			Text:         errorMessage,
		}
	}
	return &model.CommandResponse{}
}

func CreateGetOrganizationURLPost(config *OrganizationURLPostConfig, request *model.SubmitDialogRequest) error {
	api := config.API
	organizationName, ok := request.Submission[organizationSelectorFieldName].(string)
	if !ok {
		api.LogError("Request is missing field", "field", organizationSelectorFieldName)
		return fmt.Errorf("request is missing field %s", organizationSelectorFieldName)
	}

	// Using p.botID instead of user.Id will make the post come from the bot
	api.LogInfo("Creating post for organization", "organizationName", organizationName)
	if _, err := api.CreatePost(createPost(config, request, organizationName)); err != nil {
		api.LogError("Failed to post message", "err", err.Error())
		return err
	}
	return nil
}

func GetNameFromArgs(args *model.CommandArgs) string {
	fields := strings.Fields(args.Command)
	if nameWasNotProvided := len(fields) < 2; nameWasNotProvided {
		return ""
	}
	excludeTheCommandName := 1
	nameFields := fields[excludeTheCommandName:]
	if nameHasNoWhiteSpaces := len(nameFields) < 2; nameHasNoWhiteSpaces {
		firstNameWord := 0
		return nameFields[firstNameWord]
	}
	return strings.Join(nameFields, " ")
}

func getGetOrganizationURLAutocompleteData() *model.AutocompleteData {
	command := model.NewAutocompleteData(GetOrganizationURLCommandName, "", getOrganizationURLDesc)

	name := model.NewAutocompleteData(getOrganizationURLNameCommand, "", getOrganizationURLNameCommandDesc)
	// name.AddNamedTextArgument("name", "The organization name with pattern p([a-z]+)ch", "", "p([a-z]+)ch", true)
	command.AddCommand(name)

	dialog := model.NewAutocompleteData(getOrganizationURLDialogCommand, "", getOrganizationURLDialogCommandDesc)
	command.AddCommand(dialog)

	help := model.NewAutocompleteData(getOrganizationURLHelpCommand, "", getOrganizationURLHelpCommandDesc)
	command.AddCommand(help)

	return command
}

func getOrganizationURL(config *OrganizationURLConfig) string {
	name := config.Name
	config.API.LogInfo(fmt.Sprintf("Getting URL for organization %s", name))
	id := getIDByName(name)
	return getMarkdownOrganizationURL(&OrganizationURLMarkdownConfig{
		ID:   id,
		Name: name,
		PluginConfig: PluginConfig{
			PathPrefix: config.PathPrefix,
			PluginID:   config.PluginID,
			SiteURL:    config.SiteURL,
			PluginAPI: PluginAPI{
				API: config.API,
			},
		},
	})
}

func getOrganizationURLDialog() model.Dialog {
	return model.Dialog{
		CallbackId:     getOrganizationURLCallback,
		Elements:       buildModelDialogElements(),
		IconURL:        "http://www.mattermost.org/wp-content/uploads/2016/04/icon.png",
		NotifyOnCancel: getOrganizationURLNotifyOnCancel,
		State:          getOrganizationURLState,
		SubmitLabel:    getOrganizationURLSubmitLabel,
		Title:          getOrganizationURLDesc,
	}
}

func buildModelDialogElements() []model.DialogElement {
	return []model.DialogElement{{
		DisplayName: "Organization Name",
		HelpText:    "Choose a organization from the list.",
		Name:        organizationSelectorFieldName,
		Options:     buildSelectElementOtions(),
		Placeholder: "Choose a organization...",
		Type:        "select",
	}}
}

func buildSelectElementOtions() []*model.PostActionOptions {
	return []*model.PostActionOptions{
		{
			Text:  "Ecosystem",
			Value: "Ecosystem",
		},
		{
			Text:  "Organization X",
			Value: "Organization X",
		},
		{
			Text:  "Organization Y",
			Value: "Organization Y",
		},
		{
			Text:  "Organization Z",
			Value: "Organization Z",
		},
	}
}

func createPost(config *OrganizationURLPostConfig, request *model.SubmitDialogRequest, name string) *model.Post {
	id := getIDByName(name)
	config.API.LogInfo(fmt.Sprintf("Creating a post with URL for organization %s", name))
	return &model.Post{
		UserId:    config.UserID,
		ChannelId: request.ChannelId,
		Message: getMarkdownOrganizationURL(&OrganizationURLMarkdownConfig{
			ID:   id,
			Name: name,
			PluginConfig: PluginConfig{
				PathPrefix: config.PathPrefix,
				PluginID:   config.PluginID,
				SiteURL:    config.SiteURL,
				PluginAPI: PluginAPI{
					API: config.API,
				},
			},
		}),
	}
}

// TODO: This is just a mock, retrieve them in the proper way
func getIDByName(name string) string {
	switch name {
	case "Ecosytem":
		return "0"
	case "Organization X":
		return "1"
	case "Organization Y":
		return "2"
	case "Organization Z":
		return "3"
	default:
		return "0"
	}
}

func getMarkdownOrganizationURL(config *OrganizationURLMarkdownConfig) string {
	// The format is [link text here](link here)
	return fmt.Sprintf(
		"[%s](%s/%s/%s/%s)",
		config.Name,
		config.SiteURL,
		config.PluginID,
		config.PathPrefix,
		config.ID,
	)
}
