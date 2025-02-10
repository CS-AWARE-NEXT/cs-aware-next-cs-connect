package model

type EcosystemGraphNode struct {
	ID                    string `json:"id"`
	Name                  string `json:"name"`
	Description           string `json:"description"`
	Type                  string `json:"type"`
	Contacts              string `json:"contacts,omitempty"`
	CollaborationPolicies string `json:"collaborationPolicies,omitempty"`
	CriticalityLevel      int    `json:"criticalityLevel,omitempty"`
	ServiceLevelAgreement string `json:"serviceLevelAgreement,omitempty"`
	BcdrDescription       string `json:"bcdrDescription,omitempty"`
	Rto                   string `json:"rto,omitempty"`
	Rpo                   string `json:"rpo,omitempty"`
	ConfidentialityLevel  int    `json:"confidentialityLevel,omitempty"`
	IntegrityLevel        int    `json:"integrityLevel,omitempty"`
	AvailabilityLevel     int    `json:"availabilityLevel,omitempty"`
	CiaRationale          string `json:"ciaRationale,omitempty"`
	Mtpd                  string `json:"mtpd,omitempty"`
	RealtimeStatus        string `json:"realtimeStatus,omitempty"`
	EcosystemOrganization string `json:"ecosystemOrganization,omitempty"`
}

type EcosystemGraphEdge struct {
	ID                    string `json:"id"`
	SourceNodeID          string `json:"sourceNodeID"`
	DestinationNodeID     string `json:"destinationNodeID"`
	Kind                  string `json:"kind"`
	Description           string `json:"description,omitempty"`
	CriticalityLevel      int    `json:"criticalityLevel,omitempty"`
	ServiceLevelAgreement string `json:"serviceLevelAgreement,omitempty"`
	BCDRDescription       string `json:"bcdrDescription,omitempty"`
	Rto                   string `json:"rto,omitempty"`
	Rpo                   string `json:"rpo,omitempty"`
	ConfidentialityLevel  int    `json:"confidentialityLevel,omitempty"`
	IntegrityLevel        int    `json:"integrityLevel,omitempty"`
	AvailabilityLevel     int    `json:"availabilityLevel,omitempty"`
	CiaRationale          string `json:"ciaRationale,omitempty"`
	Mtpd                  string `json:"mtpd,omitempty"`
	RealtimeStatus        string `json:"realtimeStatus,omitempty"`
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
