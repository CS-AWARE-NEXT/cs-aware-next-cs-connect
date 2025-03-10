package model

import (
	"time"
)

const (
	Customer  string = "customer"
	Switch    string = "switch"
	Server    string = "server"
	VpnServer string = "vpn-server"
	Database  string = "database"
	Network   string = "network"
	Cloud     string = "cloud"
)

// Layouted indicates whether node positions are provided
type GraphData struct {
	Description GraphDescription `json:"description"`
	Edges       []GraphEdge      `json:"edges"`
	Nodes       []GraphNode      `json:"nodes"`
	Layouted    bool             `json:"layouted"`
}

type GraphNodeData struct {
	Description string `json:"description"`
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
	OldID    string            `json:"oldId"`
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

type DataLakeGraph struct {
	Type                  string              `json:"type"`
	ID                    string              `json:"id"`
	Name                  string              `json:"name"`
	Created               string              `json:"created"`
	Modified              string              `json:"modified"`
	Version               string              `json:"version"`
	Objects               []DataLakeGraphNode `json:"objects"`
	Description           string              `json:"description,omitempty"`
	XCsawareCIA           []string            `json:"x_csaware_CIA"`
	XCsawareCPE           []string            `json:"x_csaware_CPE"`
	XCategories           []string            `json:"x_categories"`
	XCsawareIP            []string            `json:"x_csaware_ip"`
	XCsawareHostname      string              `json:"x_csaware_hostname,omitempty"`
	XCsawareCriticalLevel int                 `json:"x_csaware_critical_level,omitempty"`
	XCsawareRPO           string              `json:"x_csaware_rpo,omitempty"`
	XCsawareRTO           string              `json:"x_csaware_rto,omitempty"`
	XCsawareHostedOn      string              `json:"x_csaware_hostedOn,omitempty"`
	XCsawareEmail         string              `json:"x_csaware_email,omitempty"`
	XCsawareModel         string              `json:"x_csaware_model,omitempty"`
	XCsawareSoftware      string              `json:"x_csaware_software,omitempty"`
	XCsawareVendor        string              `json:"x_csaware_vendor,omitempty"`
	XCsawareCPU           string              `json:"x_csaware_cpu,omitempty"`
	XCsawarePhoneNumber   string              `json:"x_csaware_phoneNumber,omitempty"`
	DependsFrom           string              `json:"dependsFrom,omitempty"`
	Redundancy            string              `json:"redundancy,omitempty"`
	InfrastructureType    string              `json:"infrastructure_type,omitempty"`
	NeedsInfrastructure   string              `json:"needsInfrastructure,omitempty"`
}

type DataLakeGraphNode struct {
	Type                  string   `json:"type"`
	ID                    string   `json:"id"`
	Name                  string   `json:"name"`
	BCDRRelevant          bool     `json:"bcdr_relevant"`
	HashedIDs             []string `json:"hashed_ids"`
	Created               string   `json:"created"`
	Modified              string   `json:"modified"`
	Description           string   `json:"description"`
	Source                []string `json:"source"`
	XInfoFlow             []string `json:"x_infoflow"`
	XCsawareNodeType      string   `json:"x_csaware_node_type"`
	XCsawareCIA           []string `json:"x_csaware_CIA"`
	XCsawareCPE           []string `json:"x_csaware_CPE"`
	XCategories           []string `json:"x_categories"`
	XCsawareIP            []string `json:"x_csaware_ip"`
	XCsawareHostname      string   `json:"x_csaware_hostname,omitempty"`
	XCsawareCriticalLevel int      `json:"x_csaware_critical_level,omitempty"`
	XCsawareRPO           string   `json:"x_csaware_rpo,omitempty"`
	XCsawareRTO           string   `json:"x_csaware_rto,omitempty"`
	XCsawareHostedOn      string   `json:"x_csaware_hostedOn,omitempty"`
	XCsawareEmail         string   `json:"x_csaware_email,omitempty"`
	XCsawareModel         string   `json:"x_csaware_model,omitempty"`
	XCsawareSoftware      string   `json:"x_csaware_software,omitempty"`
	XCsawareVendor        string   `json:"x_csaware_vendor,omitempty"`
	XCsawareCPU           string   `json:"x_csaware_cpu,omitempty"`
	XCsawarePhoneNumber   string   `json:"x_csaware_phoneNumber,omitempty"`
	DependsFrom           []string `json:"dependsFrom"`
	Redundancy            []string `json:"redundancy"`
	InfrastructureType    string   `json:"infrastructure_type,omitempty"`
	NeedsInfrastructure   string   `json:"needsInfrastructure,omitempty"`
	OntologyNodeType      string   `json:"OntologyNodeType,omitempty"`
}

type DataLakeGraphRoot struct {
	Graph       DataLakeGraph `json:"graph"`
	AccessLevel int           `json:"access_level"`
}

func (n DataLakeGraphNode) ToCSAwareNode(dln DataLakeGraphNode) CSAwareGraphNode {
	return CSAwareGraphNode{
		Type:        dln.Type,
		ID:          dln.ID,
		Name:        dln.Name,
		Description: dln.Description,
		Source:      dln.Source,
	}
}
