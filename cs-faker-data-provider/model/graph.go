package model

import "time"

const (
	Customer  string = "customer"
	Switch    string = "switch"
	Server    string = "server"
	VpnServer string = "vpn-server"
)

// Layouted indicates whether node positions are provided
type GraphData struct {
	Description GraphDescription `json:"description"`
	Edges       []GraphEdge      `json:"edges"`
	Nodes       []GraphNode      `json:"nodes"`
	Layouted    bool             `json:"layouted"`
}

type GraphNodeData struct {
	IsUrlHashed bool   `json:"isUrlHashed"`
	Kind        string `json:"kind"`
	Label       string `json:"label"`
	URL         string `json:"url"`
}

type GraphNodePosition struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// TODO: Details map[string]interface{} `json:"details"`
// Here an extra map type field could be added for additional information
// Additional information could be displayed on the right/bottom of the graph
// For example, it can be shown instead of the graph description
type GraphNode struct {
	Data     GraphNodeData     `json:"data"`
	ID       string            `json:"id"`
	Position GraphNodePosition `json:"position"`
	Type     string            `json:"type"`
}

type GraphEdge struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
	Type   string `json:"type"`
}

type GraphDescription struct {
	Name string `json:"name"`
	Text string `json:"text"`
}

type CSAwareGraphData struct {
	Type     string             `json:"type"`
	ID       string             `json:"id"`
	Name     string             `json:"name"`
	Created  time.Time          `json:"created"`
	Modified time.Time          `json:"modified"`
	Version  string             `json:"version"`
	Objects  []CSAwareGraphNode `json:"objects"`
}

type CSAwareGraphNode struct {
	Type             string    `json:"type"`
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Created          time.Time `json:"created"`
	Modified         time.Time `json:"modified"`
	Description      string    `json:"description"`
	Source           []string  `json:"source"`
	XInfoflow        []string  `json:"x_infoflow"`
	Cpe              string    `json:"cpe"`
	XIPRange         string    `json:"x_ip_range"`
	XPortRange       string    `json:"x_port_range"`
	XCategories      []string  `json:"x_categories"`
	XCsawareNodeType string    `json:"x_csaware_node_type,omitempty"`
	Timestamp        string    `json:"timestamp,omitempty"`
}
