
export interface EcosystemGraphNode {
    id: string,
    name: string,
    description: string,
    type: string
}

export interface EcosystemGraphEdge {
    id: string,
    sourceNodeID: string,
    destinationNodeID: string,
    kind: string
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
