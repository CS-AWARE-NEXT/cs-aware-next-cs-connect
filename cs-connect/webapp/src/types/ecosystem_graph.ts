
export interface EcosystemGraphNode {
    id: string,
    name: string,
    description: string,
    type: string,
    contacts?: string,
    collaborationPolicies?: string,
    criticalityLevel?: number,
    serviceLevelAgreement?: string,
    bcdrDescription?: string,
    rto?: string,
    rpo?: string,
    confidentialityLevel?: number,
    integrityLevel?: number,
    availabilityLevel?: number,
    ciaRationale?: string,
    mtpd?: string,
    realtimeStatus?: string,
    ecosystemOrganization?: string,
}

export interface EcosystemGraphEdge {
    id: string,
    sourceNodeID: string,
    destinationNodeID: string,
    kind: string,
    description?: string,
    criticalityLevel?: number,
    serviceLevelAgreement?: string,
    bcdrDescription?: string,
    rto?: string,
    rpo?: string,
    confidentialityLevel?: number,
    integrityLevel?: number,
    availabilityLevel?: number,
    ciaRationale?: string,
    mtpd?: string,
    realtimeStatus?: string,
}

export interface EcosystemGraph {
    nodes: EcosystemGraphNode[],
    edges: EcosystemGraphEdge[],
}

export enum LockStatus {
    NotRequested,
    Acquired,
    Busy
}

export interface ExportEcosystemGraphResult {
    success: boolean;
    message: string;
}