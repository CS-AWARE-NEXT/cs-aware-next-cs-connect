package controller

import (
	"github.com/gofiber/fiber/v2"
	"github.com/tizianocitro/csa-server/model"
)

func GetGraph(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")
	return c.JSON(graphMap[organizationId])
}

var graphMap = map[string]model.GraphData{
	"1": {
		Nodes: []model.GraphNode{
			{
				ID: "main-switch",
				Position: model.GraphNodePosition{
					X: 0,
					Y: 0,
				},
				Data: model.GraphNodeData{
					Kind:  model.Switch,
					Label: "Main-Switch",
				},
			},
			{
				ID: "server-1",
				Position: model.GraphNodePosition{
					X: 200,
					Y: -100,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Server-1",
				},
			},
			{
				ID: "vpn-x",
				Position: model.GraphNodePosition{
					X: 200,
					Y: 100,
				},
				Data: model.GraphNodeData{
					Kind:  model.VpnServer,
					Label: "VPN-X",
				},
			},
			{
				ID: "internet",
				Position: model.GraphNodePosition{
					X: 350,
					Y: 100,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Internet",
				},
			},
		},
		Edges: []model.GraphEdge{
			{
				ID:     "main-switch-server-1",
				Source: "main-switch",
				Target: "server-1",
			},
			{
				ID:     "main-switch-vpn-x",
				Source: "main-switch",
				Target: "vpn-x",
			},
			{
				ID:     "vpn-x-internet",
				Source: "vpn-x",
				Target: "internet",
			},
		},
		Description: graphDescription,
	},
	"2": {
		Nodes: []model.GraphNode{
			{
				ID: "main-switch",
				Position: model.GraphNodePosition{
					X: 0,
					Y: 0,
				},
				Data: model.GraphNodeData{
					Kind:  model.Switch,
					Label: "Main-Switch",
				},
			},
			{
				ID: "server-1",
				Position: model.GraphNodePosition{
					X: 200,
					Y: -100,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Server 1",
				},
			},
			{
				ID: "server-2",
				Position: model.GraphNodePosition{
					X: 200,
					Y: 100,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Server 2",
				},
			},
		},
		Edges: []model.GraphEdge{
			{
				ID:     "main-switch-server-1",
				Source: "main-switch",
				Target: "server-1",
			},
			{
				ID:     "main-switch-server-2",
				Source: "main-switch",
				Target: "server-2",
			},
		},
		Description: graphDescription,
	},
	"3": {
		Nodes: []model.GraphNode{
			{
				ID: "main-switch",
				Position: model.GraphNodePosition{
					X: 0,
					Y: 0,
				},
				Data: model.GraphNodeData{
					Kind:  model.Switch,
					Label: "Main-Switch",
				},
			},
			{
				ID: "vpn-x",
				Position: model.GraphNodePosition{
					X: 200,
					Y: 0,
				},
				Data: model.GraphNodeData{
					Kind:  model.VpnServer,
					Label: "VPN-X",
				},
			},
			{
				ID: "server-1",
				Position: model.GraphNodePosition{
					X: 350,
					Y: 0,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Server 1",
				},
			},
		},
		Edges: []model.GraphEdge{
			{
				ID:     "main-switch-vpn-x",
				Source: "main-switch",
				Target: "vpn-x",
			},
			{
				ID:     "vpn-x-server-1",
				Source: "vpn-x",
				Target: "server-1",
			},
		},
		Description: graphDescription,
	},
}

var graphDescription = model.GraphDescription{
	Name: "Description",
	Text: "A view of the system",
}
