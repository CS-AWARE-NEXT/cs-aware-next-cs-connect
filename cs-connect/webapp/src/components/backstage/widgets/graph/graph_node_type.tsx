import {
    Edge,
    Handle,
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
import {CopyLinkMenuItem} from 'src/components/commons/copy_link';
import {useToaster} from 'src/components/backstage/toast_banner';
import {copyToClipboard} from 'src/utils';
import {formatUrlAsMarkdown} from 'src/helpers';
import 'src/styles/nodes.scss';

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

export const fillEdges = (edges: Edge[]) => {
    const filledEdges: Edge[] = [];
    edges.forEach((edge) => {
        filledEdges.push({
            ...edge,
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
                isUrlHashed: `#${node.id}-${sectionId}-${parentId}` === sectionUrlHash,
                parentId,
                sectionId,
            },
            type: nodeType,
        });
    });
    return filledNodes;
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
    setNodeInfo: Dispatch<SetStateAction<GraphNodeInfo>>;
}> = ({
    id,
    data,
    sourcePosition,
    targetPosition,
    setNodeInfo,
}) => {
    const {formatMessage} = useIntl();
    const {add: addToast} = useToaster();
    const [openDropdown, setOpenDropdown] = useState<boolean>(false);

    const onInfoClick = () => {
        setNodeInfo({name: data.label, description: data.description});
        setOpenDropdown(false);
    };

    const onCopyLinkClick = (path: string, text: string) => {
        copyToClipboard(formatUrlAsMarkdown(path, text));
        addToast({content: formatMessage({defaultMessage: 'Copied!'})});
        setOpenDropdown(false);
    };

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
        default:
            className = 'round-rectangle';
        }
        return data.isUrlHashed ? `hyperlinked-${className}` : className;
    };

    const path = `${data.url}#${id}-${data.sectionId}-${data.parentId}`;
    return (
        <GraphNodeContainer>
            <Handle
                type={'target'}
                position={targetPosition || Position.Left}
            />
            <NodeContainer
                id={`${id}-${data.sectionId}-${data.parentId}`}
            >
                <GraphNodeInfoDropdown
                    open={openDropdown}
                    setOpen={setOpenDropdown}
                    onInfoClick={onInfoClick}
                    onCopyLinkClick={() => onCopyLinkClick(path, data.label)}
                >
                    <CopyLinkMenuItem
                        className={getClassName()}
                        path={path}
                        placeholder={data.label}
                        showIcon={false}
                        text={data.label}
                        textStyle={{
                            color: 'white',
                            fontSize: 'bold',
                            textAlign: 'center',
                        }}
                        hasHover={false}
                        onContexMenu={(e) => {
                            e.preventDefault();
                            setOpenDropdown(!openDropdown);
                        }}
                    />
                </GraphNodeInfoDropdown>
            </NodeContainer>
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

export default GraphNodeType;