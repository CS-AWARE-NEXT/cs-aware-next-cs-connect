package main

import (
	"fmt"
	"strings"

	"github.com/mattermost/mattermost-server/v6/model"
	"github.com/mattermost/mattermost-server/v6/plugin"
	"github.com/pkg/errors"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-connect/server/command"
)

// Executes a command that has been previously registered via the RegisterCommand API.
func (p *Plugin) ExecuteCommand(c *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	trigger := strings.TrimPrefix(strings.Fields(args.Command)[0], "/")
	switch trigger {
	/* case command.GetOrganizationURLCommandName:
	return p.executeGetOrganizationURLCommand(args), nil */
	case command.ResetUserOrganizationCommandName:
		return p.executeResetUserOrganizationCommand(args), nil
	default:
		return &model.CommandResponse{
			ResponseType: model.CommandResponseTypeEphemeral,
			Text:         fmt.Sprintf("Unknown command: " + args.Command),
		}, nil
	}
}

func (p *Plugin) executeGetOrganizationURLCommand(args *model.CommandArgs) *model.CommandResponse {
	serverConfig := p.API.GetConfig()
	name := command.GetNameFromArgs(args)

	switch name {
	case "help":
		return command.HelpGetOrganizationURLResponse()
	case "dialog":
		return command.OpenDialogGetOrganizationURLRequest(&command.OrganizationURLDialogConfig{
			Args: args,
			PluginConfig: command.PluginConfig{
				PathPrefix: "plugins",
				PluginID:   p.pluginID,
				SiteURL:    *serverConfig.ServiceSettings.SiteURL,
				PluginAPI: command.PluginAPI{
					API: p.API,
				},
			},
		})
	case "":
		return command.EmptyNameGetOrganizationURLResponse()
	default:
		return command.GetOrganizationURLResponse(&command.OrganizationURLConfig{
			Name: name,
			PluginConfig: command.PluginConfig{
				PathPrefix: p.pluginURLPathPrefix,
				PluginID:   p.pluginID,
				SiteURL:    *serverConfig.ServiceSettings.SiteURL,
				PluginAPI: command.PluginAPI{
					API: p.API,
				},
			},
		})
	}
}

func (p *Plugin) executeResetUserOrganizationCommand(args *model.CommandArgs) *model.CommandResponse {
	serverConfig := p.API.GetConfig()

	return command.OpenDialogResetUserOrganizationRequest(&command.ResetUserOrganizationDialogConfig{
		Args: args,
		PluginConfig: command.PluginConfig{
			PathPrefix: "plugins",
			PluginID:   p.pluginID,
			SiteURL:    *serverConfig.ServiceSettings.SiteURL,
			PluginAPI: command.PluginAPI{
				API: p.API,
			},
		},
	})
}

func (p *Plugin) registerCommands() error {
	/* if err := p.API.RegisterCommand(command.GetOrganizationURLCommand()); err != nil {
		return errors.Wrapf(err, "failed to register %s command", command.GetOrganizationURLCommandName)
	} */
	if err := p.API.RegisterCommand(command.ResetUserOrganizationCommand()); err != nil {
		return errors.Wrapf(err, "failed to register %s command", command.ResetUserOrganizationCommandName)
	}

	return nil
}
