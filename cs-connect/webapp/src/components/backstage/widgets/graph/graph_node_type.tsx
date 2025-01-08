import {
    Edge,
    Handle,
    MarkerType,
    Node,
    NodeProps,
    Position,
} from 'reactflow';
import React, {
    Dispatch,
    FC,
    SetStateAction,
    useState,
} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

// import {buildMap} from 'src/helpers';
import {PARENT_ID_PARAM, SECTION_ID_PARAM} from 'src/constants';
import {getSiteUrl} from 'src/clients';
import {GraphNodeInfo, GraphSectionOptions} from 'src/types/graph';
import {useToaster} from 'src/components/backstage/toast_banner';
import {copyToClipboard} from 'src/utils';
import {formatUrlAsMarkdown} from 'src/helpers';
import 'src/styles/nodes.scss';
import {StyledDropdownMenuItem} from 'src/components/backstage/shared';

import {GraphNodeInfoDropdown} from './graph_node_info';

export const edgeType = 'step';
export const nodeType = 'graphNodeType';

export const buildNodeUrl = (options: GraphSectionOptions) => {
    const {applyOptions, parentId, sectionId, sectionUrl} = options;
    let nodeUrl = `${getSiteUrl()}${sectionUrl}`;
    if (!applyOptions) {
        return nodeUrl;
    }

    if (parentId) {
        nodeUrl = `${nodeUrl}?${PARENT_ID_PARAM}=${parentId}`;
    }
    if (parentId && sectionId) {
        nodeUrl = `${nodeUrl}&${SECTION_ID_PARAM}=${sectionId}`;
    }
    return nodeUrl;
};

export const fillEdges = (edges: Edge[], withArrow?: boolean) => {
    const filledEdges: Edge[] = [];
    edges.forEach((edge) => {
        if (withArrow) {
            edge.markerEnd = {
                type: MarkerType.Arrow,
                height: 20,
                width: 20,
            };
        }
        filledEdges.push({
            ...edge,
            data: {
                ...edge.data,
            },
            type: edgeType,
        });
    });
    return filledEdges;
};

export const fillNodes = (
    nodes: Node[],
    options: GraphSectionOptions,
) => {
    const filledNodes: Node[] = [];
    nodes.forEach((node) => {
        const {parentId, sectionId, sectionUrlHash} = options;
        const url = buildNodeUrl(options);
        filledNodes.push({
            ...node,
            data: {
                ...node.data,
                url,
                isUrlHashed: sectionUrlHash?.includes(`#${node.id}-${sectionId}-${parentId}`),
                parentId,
                sectionId,
            },
            type: nodeType,
        });
    });
    return filledNodes;
};

/// Mark edges and connected nodes related to the url hashed nodes, so that they get rendered differently
export const markNodesAndEdges = (nodes: Node[], edges: Edge[], targetNode: Node | undefined) => {
    if (targetNode !== undefined) {
        const nodeIdsToMark: string[] = [targetNode.id];

        edges.map((edge) => {
            if (edge.source === targetNode.id || edge.target === targetNode.id) {
                edge.style = {...edge.style, stroke: '#1BC41B', strokeWidth: 2};
                if (edge.source === targetNode.id) {
                    nodeIdsToMark.push(edge.target);
                } else {
                    nodeIdsToMark.push(edge.source);
                }
            } else {
                edge.style = {};
            }
            return edge;
        });

        nodes.forEach((node) => {
            if (nodeIdsToMark.includes(node.id)) {
                if (node.id === targetNode.id) {
                    node.data = {...node.data, isUrlHashed: true};
                } else {
                    node.data = {...node.data, isUrlHashed: false, marked: true};
                }
            } else if (!node.data.isUrlHashed || (node.data.isUrlHashed && node.id !== targetNode.id)) {
                // We also need to reset isUrlHashed for the case where the user performs a search after using a node's hyperlink
                node.data = {...node.data, isUrlHashed: false, marked: false};
            }
        });
        targetNode.data = {...targetNode.data, isUrlHashed: true};
    }
};

// const nodeKindMap = buildMap([
//     {key: 'switch', value: '5px'},
//     {key: 'server', value: '10px'},
//     {key: 'vpn-server', value: '0px'},
//     {key: 'customer', value: '50%'},
//     {key: 'database', value: '0px'},
//     {key: 'network', value: '0px'},
//     {key: 'cloud', value: '0px'},
// ]);

// These can be alternatives to nodes color
// background: 'rgb(var(--button-bg-rgb), 0.4)',
// border: '1px solid rgb(var(--button-bg-rgb), 0.2)',
const GraphNodeType: FC<NodeProps & {
    setNodeInfo?: Dispatch<SetStateAction<GraphNodeInfo>>;
    setTargetNodeId?: (nodeId: string) => void;
    setIsDrawerOpen?: Dispatch<SetStateAction<boolean>>;
    hyperlinkPath?: string;
    onNodeClick?: (id: string) => void;
}> = ({
    id,
    data,
    sourcePosition,
    targetPosition,
    setNodeInfo,
    setTargetNodeId,
    setIsDrawerOpen,
    hyperlinkPath,
    onNodeClick,
}) => {
    const {formatMessage} = useIntl();
    const {add: addToast} = useToaster();
    const [openDropdown, setOpenDropdown] = useState<boolean>(false);

    const getClassName = () => {
        let className = 'round-rectangle';
        switch (data.kind) {
        case 'database':
            className = 'database';
            break;
        case 'cloud':
            className = 'cloud';
            break;
        case 'internet':
            className = 'cloud';
            break;
        case 'network':
            className = 'network';
            break;
        case 'firewall':
            className = 'network';
            break;
        case 'rectangle':
            className = 'rectangle';
            break;
        case 'oval':
            className = 'oval';
            break;
        default:
            className = 'round-rectangle';
        }

        if (data.isUrlHashed) {
            return `hyperlinked-${className}`;
        }
        if (data.marked) {
            return `marked-${className}`;
        }
        return className;
    };

    let content = (
        <NodeContents
            className={getClassName()}
            style={{pointerEvents: 'visibleStroke', cursor: 'pointer'}}
            onClick={() => {
                if (onNodeClick) {
                    onNodeClick(id);
                }
            }}
        >
            <span
                style={{
                    color: 'white',
                    fontSize: 'bold',
                    textAlign: 'center',
                }}
            >{data.label}</span>
        </NodeContents>
    );
    if (setNodeInfo && setTargetNodeId && setIsDrawerOpen && hyperlinkPath) {
        const onInfoClick = () => {
            setIsDrawerOpen(true);
            setNodeInfo({name: data.label, description: data.description, nodeId: id});
            setOpenDropdown(false);
        };

        const onCopyLinkClick = (path: string, text: string) => {
            copyToClipboard(formatUrlAsMarkdown(path, `${hyperlinkPath}.${text}`));
            addToast({content: formatMessage({defaultMessage: 'Copied!'})});
            setOpenDropdown(false);
        };

        const onViewConnectionsClick = () => {
            setTargetNodeId(id);
            setOpenDropdown(false);
        };

        content = (
            <GraphNodeInfoDropdown
                open={openDropdown}
                setOpen={setOpenDropdown}
                onInfoClick={onInfoClick}
                onCopyLinkClick={() => onCopyLinkClick(path, data.label)}
                onViewConnectionsClick={onViewConnectionsClick}
            >
                <StyledDropdownMenuItem
                    className={getClassName()}
                    hasHover={false}
                    onClick={() => {
                        setTargetNodeId(id);
                    }}
                    onContextMenu={(e: any) => {
                        e.preventDefault();
                        setOpenDropdown(!openDropdown);
                    }}
                >
                    <span
                        style={{
                            color: 'white',
                            fontSize: 'bold',
                            textAlign: 'center',
                        }}
                    >{data.label}</span>
                </StyledDropdownMenuItem>
            </GraphNodeInfoDropdown>
        );
    }

    const path = `${data.url}#${id}-${data.sectionId}-${data.parentId}`;
    return (
        <GraphNodeContainer>
            <Handle
                type={'target'}
                position={targetPosition || Position.Left}
            />
            <NodeContainer
                id={`${id}-${data.sectionId}-${data.parentId}`}
                className={`parent-${getClassName()}`}
            >{content}</NodeContainer>
            <Handle
                type={'source'}
                position={sourcePosition || Position.Right}
            />
        </GraphNodeContainer>
    );
};

// background: ${(props) => (props.isUrlHashed ? 'rgb(244, 180, 0)' : 'var(--center-channel-bg)')};
// border: ${(props) => (props.noBorder ? '' : '1px solid rgba(var(--center-channel-color-rgb), 0.8)')};
// border-radius: ${(props) => nodeKindMap.get(props.kind)};
// const NodeContainer = styled.div<{isUrlHashed?: boolean, kind?: string, noBorder?: boolean}>``;
const NodeContainer = styled.div``;
const GraphNodeContainer = styled.div``;
const NodeContents = styled.div<{svgMarginRight?: string}>`
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
        margin-right: ${(props) => (props.svgMarginRight ? props.svgMarginRight : '11px')};
        fill: rgb(var(--center-channel-color-rgb), 0.56);
    }
`;

export default GraphNodeType;
