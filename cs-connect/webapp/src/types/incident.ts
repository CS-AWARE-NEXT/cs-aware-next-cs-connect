type CriticalAsset = {
    type: string | null;
    asset_identifier: string;
};

type AnomalyDetails = {
    detection_time: string;
    src_ip: string | null;
    dest_ip: string;
    protocol: string;
    raw_line: string;
    file_path: string;
    line_number: number;
};

type Attributes = {
    critical_asset: CriticalAsset;
    anomaly_details: AnomalyDetails;
};

export type Anomaly = {
    type: string;
    id: string;
    is_anomaly: boolean;
    description: string;
    anomaly_category: string;
    timestamp: string;
    attributes: Attributes;
};

export type Incident = {
    id: number;
    reference_id: string;
    organisation_id: string;
    title: string;
    description: string;
    created_time: string;
    detected_time: string;
    modified_time: string;
    notes: string;
    status: string;
    attack_type: string;
    severity: string | number | null;
    system_graph_relations: string[];
    access_level: string;
    bcdr_status: string | null;
    bcdr_relevant: boolean;
    last_modified_entity: string[];
    anomalies: Anomaly[];
};