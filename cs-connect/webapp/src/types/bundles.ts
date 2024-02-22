export type BundleData = {
    type: string;
    id: string;
    objects: BundleObject[];
};

type BundleObject = {
    type: string;
    spec_version: string;
    id: string;
    created: string;
    modified: string;
    name?: string;
    description?: string;
    indicator_types?: string[];
    pattern?: string;
    pattern_type?: string;
    valid_from?: string;
    malware_types?: string[];
    is_family?: boolean;
    kill_chain_phases?: KillChainPhases[];
    relationship_type?: string;
    source_ref?: string;
    target_ref?: string;
};

type KillChainPhases = {
    kill_chain_name: string;
    phase_name: string;
};

export enum BundleObjectType {
    Indicator = 'indicator',
    Malware = 'malware',
    Relationship = 'relationship',
}