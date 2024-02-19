package model

type EcosystemGraphNode struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Type        string `json:"type"`
}

type EcosystemGraphEdge struct {
	ID                string `json:"id"`
	SourceNodeID      string `json:"sourceNodeID"`
	DestinationNodeID string `json:"destinationNodeID"`
	Kind              string `json:"kind"`
}

type EcosystemGraphData struct {
	Nodes []*EcosystemGraphNode `json:"nodes"`
	Edges []*EcosystemGraphEdge `json:"edges"`
}

type RefreshLockEcosystemGraphParams struct {
	Nodes     []*EcosystemGraphNode `json:"nodes"`
	Edges     []*EcosystemGraphEdge `json:"edges"`
	UserID    string                `json:"userID"`
	LockDelay int                   `json:"lockDelay"`
}

type DropLockEcosystemGraphParams struct {
	UserID string `json:"userID"`
}
