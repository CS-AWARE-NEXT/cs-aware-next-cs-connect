package model

import "time"

type STIXBundle struct {
	Type    string          `json:"type"`
	ID      string          `json:"id"`
	Objects []BundleObjects `json:"objects"`
}

type BundleObjects struct {
	Type             string            `json:"type"`
	SpecVersion      string            `json:"spec_version"`
	ID               string            `json:"id"`
	Created          time.Time         `json:"created"`
	Modified         time.Time         `json:"modified"`
	Name             string            `json:"name,omitempty"`
	Description      string            `json:"description,omitempty"`
	IndicatorTypes   []string          `json:"indicator_types,omitempty"`
	Pattern          string            `json:"pattern,omitempty"`
	PatternType      string            `json:"pattern_type,omitempty"`
	ValidFrom        time.Time         `json:"valid_from,omitempty"`
	MalwareTypes     []string          `json:"malware_types,omitempty"`
	IsFamily         bool              `json:"is_family,omitempty"`
	KillChainPhases  []KillChainPhases `json:"kill_chain_phases,omitempty"`
	RelationshipType string            `json:"relationship_type,omitempty"`
	SourceRef        string            `json:"source_ref,omitempty"`
	TargetRef        string            `json:"target_ref,omitempty"`
}

type KillChainPhases struct {
	KillChainName string `json:"kill_chain_name"`
	PhaseName     string `json:"phase_name"`
}
