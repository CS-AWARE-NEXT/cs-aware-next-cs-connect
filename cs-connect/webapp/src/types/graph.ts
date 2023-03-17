import {Edge, Node} from 'reactflow';

export interface GraphData {
    description?: GraphDescription,
    edges: Edge[];
    nodes: Node[];
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

export const emptyDescription = {
    name: '',
    text: '',
};