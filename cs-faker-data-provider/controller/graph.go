package controller

import (
	"encoding/json"
	"fmt"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/data"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/model"
	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/util"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"gopkg.in/karalabe/cookiejar.v2/graph"
	"gopkg.in/karalabe/cookiejar.v2/graph/bfs"
)

type GraphController struct{}

func NewGraphController() *GraphController {
	return &GraphController{}
}

func (gc *GraphController) GetGraph(c *fiber.Ctx) error {
	organizationId := c.Params("organizationId")

	// TODO: Temporary to return the same graph of organization
	// Demo CS-AWARE for the organization NexDev CS-AWARE
	if organizationId > "4" {
		graphData, err := gc.getGraphFromJson(organizationId)
		if err != nil {
			return c.JSON(model.GraphData{})
		}
		return c.JSON(graphData)
	}
	return c.JSON(graphMap[organizationId])
}

func (gc *GraphController) getGraphFromJson(organizationId string) (model.GraphData, error) {
	organizationName := "foggia"
	if organizationId == "6" {
		organizationName = "larissa"
	}
	if organizationId == "7" {
		organizationName = "deyal"
	}
	if organizationId == "8" {
		organizationName = "5thype"
	}
	if organizationId == "9" {
		organizationName = "nextdev"
	}
	filePath, err := util.GetEmbeddedFilePath(fmt.Sprintf("%s.json", organizationName), "*.json")
	if err != nil {
		return model.GraphData{}, err
	}

	// It can also be done directly this way
	// content, err := data.Data.ReadFile(fmt.Sprintf("%s.json", organizationName))
	content, err := data.Data.ReadFile(filePath)
	if err != nil {
		return model.GraphData{}, err
	}

	if organizationId == "9" {
		return gc.fromDataLakeGraphData(content)
	}

	if organizationId >= "6" || organizationId <= "8" {
		var csAwareGraphData model.CSAwareGraphData
		err = json.Unmarshal(content, &csAwareGraphData)
		if err != nil {
			return model.GraphData{}, err
		}
		return gc.fromCSAwareGraphData(csAwareGraphData), nil
	}

	return model.GraphData{}, nil
}

func (gc *GraphController) fromDataLakeGraphData(content []byte) (model.GraphData, error) {
	log.Info("Getting graph data from DataLake")

	var dataLakeGraphData model.DataLakeGraphRoot
	err := json.Unmarshal(content, &dataLakeGraphData)
	if err != nil {
		return model.GraphData{}, err
	}

	nodes := []model.GraphNode{}
	edges := []model.GraphEdge{}

	log.Info("Creating data lake nodes")
	for _, dataLakeNode := range dataLakeGraphData.Graph.Objects {
		nodes = append(nodes, model.GraphNode{
			Position: model.GraphNodePosition{X: 0, Y: 0},
			ID:       dataLakeNode.ID,
			Data: model.GraphNodeData{
				Label:       dataLakeNode.Name,
				Description: dataLakeNode.Description,
				Kind:        dataLakeNode.XCsawareNodeType,
			},
		})
	}

	log.Info("Converting data lake nodes to CSA nodes")
	csaNodes := []model.CSAwareGraphNode{}
	for _, dln := range dataLakeGraphData.Graph.Objects {
		csaNodes = append(csaNodes, dln.ToCSAwareNode(dln))
	}

	log.Info("Creating data lake edges")
	nodeIndexes, nodeIDs, bfs := gc.getBfs(csaNodes)
	for _, node := range nodes {
		path := bfs.Path(nodeIndexes[node.ID])
		if len(path) < 2 {
			continue
		}
		index := path[len(path)-2]
		ID := nodeIDs[index]
		edges = append(edges, model.GraphEdge{
			ID:     fmt.Sprintf("%s-%s", ID, node.ID),
			Source: ID,
			Target: node.ID,
		})
	}

	log.Info("Creating data lake nodes")
	return model.GraphData{
		Description: model.GraphDescription{
			Name: "Description",
			Text: fmt.Sprintf("%s %s, version %s", dataLakeGraphData.Graph.Name, dataLakeGraphData.Graph.Type, dataLakeGraphData.Graph.Version),
		},
		Nodes:    nodes,
		Edges:    edges,
		Layouted: false,
	}, nil
}

func (gc *GraphController) fromCSAwareGraphData(csAwareGraphData model.CSAwareGraphData) model.GraphData {
	nodes := []model.GraphNode{}
	edges := []model.GraphEdge{}
	for _, csAwareNode := range csAwareGraphData.Objects {
		nodes = append(nodes, model.GraphNode{
			Position: model.GraphNodePosition{X: 0, Y: 0},
			ID:       csAwareNode.ID,
			Data: model.GraphNodeData{
				Label:       csAwareNode.Name,
				Description: csAwareNode.Description,
				Kind:        csAwareNode.XCsawareNodeType,
			},
		})

		// for _, source := range csAwareNode.Source {
		// 	repeated := false
		// 	for _, edge := range edges {
		// 		leftID := fmt.Sprintf("%s-%s", csAwareNode.ID, source)
		// 		rigthID := fmt.Sprintf("%s-%s", source, csAwareNode.ID)
		// 		if edge.ID == leftID || edge.ID == rigthID {
		// 			repeated = true
		// 		}
		// 	}
		// 	if repeated {
		// 		continue
		// 	}
		// 	edges = append(edges, model.GraphEdge{
		// 		ID:         fmt.Sprintf("%s-%s", csAwareNode.ID, source),
		// 		SourceName: csAwareNode.Name,
		// 		Source:     csAwareNode.ID,
		// 		TargetName: source,
		// 		Target:     source,
		// 	})
		// }
	}
	nodeIndexes, nodeIDs, bfs := gc.getBfs(csAwareGraphData.Objects)
	for _, node := range nodes {
		path := bfs.Path(nodeIndexes[node.ID])
		if len(path) < 2 {
			continue
		}
		index := path[len(path)-2]
		ID := nodeIDs[index]
		edges = append(edges, model.GraphEdge{
			ID:     fmt.Sprintf("%s-%s", ID, node.ID),
			Source: ID,
			Target: node.ID,
		})
	}

	return model.GraphData{
		Description: model.GraphDescription{
			Name: "Description",
			Text: fmt.Sprintf("%s %s, version %s", csAwareGraphData.Name, csAwareGraphData.Type, csAwareGraphData.Version),
		},
		Nodes:    nodes,
		Edges:    edges,
		Layouted: false,
	}
}

func (gc *GraphController) getBfs(nodes []model.CSAwareGraphNode) (map[string]int, map[int]string, *bfs.Bfs) {
	root, count := gc.getRootAndCount(nodes)
	if count < 0 {
		return nil, nil, nil
	}
	nodeIndexes, nodeIDs := gc.nodesToMaps(nodes)
	g := graph.New(count)
	for index, node := range nodes {
		for _, source := range node.Source {
			g.Connect(index, nodeIndexes[source])
		}
	}
	return nodeIndexes, nodeIDs, bfs.New(g, root)
}

// TODO: we need a way to identify the root node in all graphs (a dedicated field)
func (gc *GraphController) getRootAndCount(nodes []model.CSAwareGraphNode) (int, int) {
	for index, node := range nodes {
		if node.Type == "root" {
			return index, len(nodes)
		}

		// This is temporary until we are provided with a way to udentify the root node in all graphs
		if node.Name == "Internet" {
			return index, len(nodes)
		}
	}
	return -1, -1
}

func (gc *GraphController) nodesToMaps(nodes []model.CSAwareGraphNode) (map[string]int, map[int]string) {
	nodeIndexes := make(map[string]int)
	nodeIDs := make(map[int]string)
	for index, node := range nodes {
		nodeIndexes[node.ID] = index
		nodeIDs[index] = node.ID
	}
	return nodeIndexes, nodeIDs
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
		Layouted:    true,
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
		Layouted:    true,
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
		Layouted:    true,
	},
	"4": {
		Nodes: []model.GraphNode{
			{
				ID: "wan-switch",
				Position: model.GraphNodePosition{
					X: 0,
					Y: 0,
				},
				Data: model.GraphNodeData{
					Kind:  model.Switch,
					Label: "WAN-Switch",
				},
			},
			{
				ID: "main-switch",
				Position: model.GraphNodePosition{
					X: 200,
					Y: -100,
				},
				Data: model.GraphNodeData{
					Kind:  model.Switch,
					Label: "Main-Switch",
				},
			},
			{
				ID: "network-lan-1",
				Position: model.GraphNodePosition{
					X: 200,
					Y: 200,
				},
				Data: model.GraphNodeData{
					Kind:  model.Switch,
					Label: "Network-LAN-1",
				},
			},
			{
				ID: "lan-switch",
				Position: model.GraphNodePosition{
					X: 400,
					Y: -300,
				},
				Data: model.GraphNodeData{
					Kind:  model.Switch,
					Label: "LAN-Switch",
				},
			},
			{
				ID: "main-router",
				Position: model.GraphNodePosition{
					X: 400,
					Y: -150,
				},
				Data: model.GraphNodeData{
					Kind:  model.Switch,
					Label: "Main-Router",
				},
			},
			{
				ID: "server-2",
				Position: model.GraphNodePosition{
					X: 1200,
					Y: -50,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Server-2",
				},
			},
			{
				ID: "server-3",
				Position: model.GraphNodePosition{
					X: 400,
					Y: 0,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Server-3",
				},
			},
			{
				ID: "vpn-x",
				Position: model.GraphNodePosition{
					X: 400,
					Y: 100,
				},
				Data: model.GraphNodeData{
					Kind:  model.VpnServer,
					Label: "VPN-X",
				},
			},
			{
				ID: "web-page-wordpress",
				Position: model.GraphNodePosition{
					X: 400,
					Y: 300,
				},
				Data: model.GraphNodeData{
					Kind:  model.Switch,
					Label: "webpage [wordpress]",
				},
			},
			{
				ID: "system-1",
				Position: model.GraphNodePosition{
					X: 600,
					Y: -400,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "System1",
				},
			},
			{
				ID: "system-2",
				Position: model.GraphNodePosition{
					X: 600,
					Y: -200,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "System2",
				},
			},
			{
				ID: "business-intelligence",
				Position: model.GraphNodePosition{
					X: 900,
					Y: -700,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Business-Intelligence",
				},
			},
			{
				ID: "x-board",
				Position: model.GraphNodePosition{
					X: 900,
					Y: -600,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "X-Board",
				},
			},
			{
				ID: "contract-handler",
				Position: model.GraphNodePosition{
					X: 900,
					Y: -500,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Contract-handler",
				},
			},
			{
				ID: "economy",
				Position: model.GraphNodePosition{
					X: 900,
					Y: -300,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Economy",
				},
			},
			{
				ID: "expenses",
				Position: model.GraphNodePosition{
					X: 900,
					Y: -200,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Expenses",
				},
			},
			{
				ID: "library",
				Position: model.GraphNodePosition{
					X: 900,
					Y: -100,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Library",
				},
			},
			{
				ID: "personnel",
				Position: model.GraphNodePosition{
					X: 800,
					Y: 0,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Personnel",
				},
			},
			{
				ID: "time-management",
				Position: model.GraphNodePosition{
					X: 800,
					Y: 100,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Time-management",
				},
			},
			{
				ID: "salary-handling",
				Position: model.GraphNodePosition{
					X: 800,
					Y: 200,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Salary-handling",
				},
			},
			{
				ID: "internet",
				Position: model.GraphNodePosition{
					X: 600,
					Y: 50,
				},
				Data: model.GraphNodeData{
					Kind:        model.Switch,
					Label:       "Internet",
					Description: "Internet node",
				},
			},
			{
				ID: "vpn-router",
				Position: model.GraphNodePosition{
					X: 600,
					Y: 350,
				},
				Data: model.GraphNodeData{
					Kind:  model.VpnServer,
					Label: "VPN-Router",
				},
			},
			{
				ID: "firewall",
				Position: model.GraphNodePosition{
					X: 750,
					Y: 300,
				},
				Data: model.GraphNodeData{
					Kind:  model.VpnServer,
					Label: "Firewall",
				},
			},
			{
				ID: "area-51",
				Position: model.GraphNodePosition{
					X: 800,
					Y: 400,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Area-51",
				},
			},
			{
				ID: "vpn-x2",
				Position: model.GraphNodePosition{
					X: 800,
					Y: 500,
				},
				Data: model.GraphNodeData{
					Kind:  model.VpnServer,
					Label: "VPN-X2",
				},
			},
			{
				ID: "valve",
				Position: model.GraphNodePosition{
					X: 1200,
					Y: 50,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Valve",
				},
			},
			{
				ID: "security-management",
				Position: model.GraphNodePosition{
					X: 1100,
					Y: 350,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "Security-management",
				},
			},
			{
				ID: "customer",
				Position: model.GraphNodePosition{
					X: 1400,
					Y: -50,
				},
				Data: model.GraphNodeData{
					Kind:  model.Customer,
					Label: "Customer",
				},
			},
			{
				ID: "system1-backend",
				Position: model.GraphNodePosition{
					X: 1400,
					Y: 350,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "System1-backend",
				},
			},
			{
				ID: "system2-backend",
				Position: model.GraphNodePosition{
					X: 1400,
					Y: 250,
				},
				Data: model.GraphNodeData{
					Kind:  model.Server,
					Label: "System2-backend",
				},
			},
		},
		Edges: []model.GraphEdge{
			{
				ID:     "wan-switch-main-switch",
				Source: "wan-switch",
				Target: "main-switch",
			},
			{
				ID:     "wan-switch-network-lan-1",
				Source: "wan-switch",
				Target: "network-lan-1",
			},
			{
				ID:     "main-switch-lan-switch",
				Source: "main-switch",
				Target: "lan-switch",
			},
			{
				ID:     "main-switch-main-router",
				Source: "main-switch",
				Target: "main-router",
			},
			{
				ID:     "main-switch-server-3",
				Source: "main-switch",
				Target: "server-3",
			},
			{
				ID:     "main-switch-server-2",
				Source: "main-switch",
				Target: "server-2",
			},
			{
				ID:     "main-switch-vpn-x",
				Source: "main-switch",
				Target: "vpn-x",
			},
			{
				ID:     "network-lan-1-web-page-wordpress",
				Source: "network-lan-1",
				Target: "web-page-wordpress",
			},
			{
				ID:     "lan-switch-system-1",
				Source: "lan-switch",
				Target: "system-1",
			},
			{
				ID:     "lan-switch-system-2",
				Source: "lan-switch",
				Target: "system-2",
			},
			{
				ID:     "system-1-business-intelligence",
				Source: "system-1",
				Target: "business-intelligence",
			},
			{
				ID:     "system-1-x-board",
				Source: "system-1",
				Target: "x-board",
			},
			{
				ID:     "system-1-contract-handler",
				Source: "system-1",
				Target: "contract-handler",
			},
			{
				ID:     "system-1-economy",
				Source: "system-1",
				Target: "economy",
			},
			{
				ID:     "system-1-expenses",
				Source: "system-1",
				Target: "expenses",
			},
			{
				ID:     "system-1-library",
				Source: "system-1",
				Target: "library",
			},
			{
				ID:     "system-2-personnel",
				Source: "system-2",
				Target: "personnel",
			},
			{
				ID:     "system-2-time-management",
				Source: "system-2",
				Target: "time-management",
			},
			{
				ID:     "system-2-salary-handling",
				Source: "system-2",
				Target: "salary-handling",
			},
			{
				ID:     "vpn-x-internet",
				Source: "vpn-x",
				Target: "internet",
			},
			{
				ID:     "vpn-x-vpn-router",
				Source: "vpn-x",
				Target: "vpn-router",
			},
			{
				ID:     "internet-firewall",
				Source: "internet",
				Target: "firewall",
			},
			{
				ID:     "firewall-server-2",
				Source: "firewall",
				Target: "server-2",
			},
			{
				ID:     "vpn-router-area-51",
				Source: "vpn-router",
				Target: "area-51",
			},
			{
				ID:     "vpn-router-vpn-x2",
				Source: "vpn-router",
				Target: "vpn-x2",
			},
			{
				ID:     "area-51-valve",
				Source: "area-51",
				Target: "valve",
			},
			{
				ID:     "valve-customer",
				Source: "valve",
				Target: "customer",
			},
			{
				ID:     "vpn-x2-security-management",
				Source: "vpn-x2",
				Target: "security-management",
			},
			{
				ID:     "security-management-system1-backend",
				Source: "security-management",
				Target: "system1-backend",
			},
			{
				ID:     "security-management-system2-backend",
				Source: "security-management",
				Target: "system2-backend",
			},
		},
		Description: graphDescription,
		Layouted:    true,
	},
}

var graphDescription = model.GraphDescription{
	Name: "Description",
	Text: "A view of the system",
}
