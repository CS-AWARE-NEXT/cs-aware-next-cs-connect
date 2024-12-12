package model

type DataLakeIncidentCompact struct {
	OrganizationID string `json:"organisation_id"`
	ID             string `json:"incident_reference_id"`
	Title          string `json:"title"`
	Description    string `json:"description"`
}

type CriticalAsset struct {
	Type            string `json:"type,omitempty"`
	AssetIdentifier string `json:"asset_identifier"`
}

type AnomalyDetails struct {
	DetectionTime string  `json:"detection_time"`
	SrcIP         *string `json:"src_ip,omitempty"`
	DestIP        string  `json:"dest_ip"`
	Protocol      string  `json:"protocol"`
	RawLine       string  `json:"raw_line"`
	FilePath      string  `json:"file_path"`
	LineNumber    int     `json:"line_number"`
}

type Attributes struct {
	CriticalAsset  CriticalAsset  `json:"critical_asset"`
	AnomalyDetails AnomalyDetails `json:"anomaly_details"`
}

type Anomaly struct {
	Type            string     `json:"type"`
	ID              string     `json:"id"`
	IsAnomaly       bool       `json:"is_anomaly"`
	Description     string     `json:"description"`
	AnomalyCategory string     `json:"anomaly_category"`
	Timestamp       string     `json:"timestamp"`
	Attributes      Attributes `json:"attributes"`
}

type LastModifiedEntity struct {
	Timestamp          string `json:"timestamp"`
	LastModifiedEntity string `json:"last_modified_entity"`
}

type DataLakeIncident struct {
	ID             int64  `json:"id"`
	ReferenceID    string `json:"reference_id"`
	OrganisationID string `json:"organisation_id"`

	// custom marshal logic (it is read from the title field coming from the API)
	Name string `json:"name"`

	Title        string `json:"title"`
	Description  string `json:"description"`
	CreatedTime  string `json:"created_time"`
	DetectedTime string `json:"detected_time"`
	ModifiedTime string `json:"modified_time"`
	Notes        string `json:"notes"`
	Status       string `json:"status"`
	AttackType   string `json:"attack_type"`

	// string | number | null
	Severity int64 `json:"severity"`

	SystemGraphRelations []string `json:"system_graph_relations"`
	AccessLevel          int64    `json:"access_level"`

	// string | null
	BCDRStatus    string `json:"bcdr_status,omitempty"`
	ContextStatus string `json:"context_status,omitempty"`

	BCDRRelevant       bool                 `json:"bcdr_relevant"`
	LastModifiedEntity []LastModifiedEntity `json:"last_modified_entity"`
	Anomalies          []Anomaly            `json:"anomalies"`
}

func CreateFakeIncident() DataLakeIncident {
	return DataLakeIncident{
		ID:                   24,
		ReferenceID:          "incident--bab6087c-904f-42ac-80c2-93594b8ac86a",
		OrganisationID:       "30",
		Name:                 "Potential DoS Attack 2024-11-11T16:25:46Z",
		Title:                "Potential DoS Attack 2024-11-11T16:25:46Z",
		Description:          "Anomalous connection detected from source IP None to destination IP None over 6 protocol.",
		CreatedTime:          "2024-11-11T16:25:46.320616+00:00",
		DetectedTime:         "2024-10-29T16:51:53.484845+00:00",
		ModifiedTime:         "2024-11-21T09:54:27.141297+00:00",
		Notes:                "Anomalous connection detected from source IP None to destination IP None over 6 protocol.",
		Status:               "open",
		AttackType:           "ddos",
		Severity:             3,
		SystemGraphRelations: []string{"unknown", "unknown"},
		AccessLevel:          1,
		BCDRStatus:           "",
		BCDRRelevant:         true,
		ContextStatus:        "needs_contextualisation",
		LastModifiedEntity:   []LastModifiedEntity{},
		Anomalies: []Anomaly{
			{
				Type:            "lineguard",
				ID:              "c4cc5d9808789452ebc904a7070d466b873763fb72b1506c72d7d4965dbbc3fc",
				IsAnomaly:       false,
				Description:     "Anomalous connection detected from source IP None to destination IP None over 6 protocol.",
				AnomalyCategory: "Potential DoS Attack",
				Timestamp:       "2024-10-29T16:51:53.484878+00:00",
				Attributes: Attributes{
					CriticalAsset: CriticalAsset{
						Type:            "",
						AssetIdentifier: "unknown",
					},
					AnomalyDetails: AnomalyDetails{
						DetectionTime: "2024-10-29T16:51:53.484890+00:00",
						SrcIP:         nil,
						DestIP:        "192.168.33.137",
						Protocol:      "sctp",
						RawLine:       "{'orig_h': '66.111.57.16', 'orig_p': 55736, 'resp_h': '172.31.66.46', 'resp_p': 80, 'proto': 6, 'flow_bytes_toclient': 40, 'flow_bytes_toserver': 0, 'flow_pkts_toserver': 1, 'flow_pkts_toclient': 0, 'duration': 0, 'line_number': 1023995}",
						FilePath:      "test/suricata_NF-CSE-CIC-IDS2018.csv",
						LineNumber:    1023995,
					},
				},
			},
			{
				Type:            "lineguard",
				ID:              "d863db0e8eabec2a34cd43f935ef20b27a400f34638f401774869da92f427daa",
				IsAnomaly:       false,
				Description:     "Anomalous connection detected from source IP None to destination IP None over 6 protocol.",
				AnomalyCategory: "Potential DoS Attack",
				Timestamp:       "2024-10-29T16:51:53.484832+00:00",
				Attributes: Attributes{
					CriticalAsset: CriticalAsset{
						Type:            "",
						AssetIdentifier: "unknown",
					},
					AnomalyDetails: AnomalyDetails{
						DetectionTime: "2024-10-29T16:51:53.484845+00:00",
						SrcIP:         nil,
						DestIP:        "192.168.34.130",
						Protocol:      "sctp",
						RawLine:       "{'orig_h': '172.31.66.46', 'orig_p': 49380, 'resp_h': '23.13.170.220', 'resp_p': 80, 'proto': 6, 'flow_bytes_toclient': 4159, 'flow_bytes_toserver': 124391, 'flow_pkts_toserver': 33, 'flow_pkts_toclient': 100, 'duration': 4178925, 'line_number': 1022083}",
						FilePath:      "test/suricata_NF-CSE-CIC-IDS2018.csv",
						LineNumber:    1022083,
					},
				},
			},
		},
	}
}
