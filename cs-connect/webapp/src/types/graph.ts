import {Edge, Node, PanelPosition} from 'reactflow';

// TODO: type GraphNode = Node & {details: Map<string, any>}
// Here an extra map type field could be added for additional information to the Node type
// Additional information could be displayed on the right/bottom of the graph
// For example, it can be shown instead of the graph description
// Or when the user clicks on an AntD dropdown with an info element
export interface GraphData {
    description?: GraphDescription,
    edges: Edge[];
    nodes: Node[];
    layouted?: boolean;
}

export interface GraphDescription {
    name: string;
    text: string;
}

export type GraphSectionOptions = {
    applyOptions: boolean;
    parentId: string;
    sectionId: string;
    sectionUrl?: string;
    sectionUrlHash?: string;
};

// IMPORTANT: add here extra node data info
export type GraphNodeInfo = {
    nodeId: string;
    kind?: string,
    name: string;
    description?: string;
    contacts?: string;
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
};

// IMPORTANT: add here extra edge data info
export type GraphEdgeInfo = {
    edgeId: string;
    kind?: string,
    description?: string;
    criticalityLevel?: number;
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
};

export type GraphDirection = 'LR' | 'TB';

export enum Direction {
    HORIZONTAL = 'LR',
    VERTICAL = 'TB'
}

export const panelPosition: PanelPosition = 'bottom-center';

export const emptyDescription = {
    name: '',
    text: '',
};

export const EMPTY_NODE_DESCRIPTION = 'Node description is not available';
export const EMPTY_EDGE_DESCRIPTION = 'Edge description is not available';
