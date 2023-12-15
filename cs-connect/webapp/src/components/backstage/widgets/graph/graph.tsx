import 'reactflow/dist/style.css';
import React, {
    Dispatch,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import ReactFlow, {
    Background,
    Controls,
    Edge,
    FitViewOptions,
    MiniMap,
    Node,
    Panel,
    Position,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from 'reactflow';
import styled from 'styled-components';
import Dagre from 'dagre';
import {
    Button,
    Drawer,
    Select,
    Tooltip,
} from 'antd';
import {PartitionOutlined} from '@ant-design/icons';
import {useIntl} from 'react-intl';
import {getCurrentChannelId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';
import {useSelector} from 'react-redux';

import {useLocation} from 'react-router-dom';

import {isEqual} from 'lodash';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext, IsRhsClosedContext} from 'src/components/rhs/rhs';
import {
    Direction,
    GraphData,
    GraphDescription,
    GraphDirection,
    GraphNodeInfo as NodeInfo,
    emptyDescription,
    panelPosition,
} from 'src/types/graph';
import TextBox, {TextBoxStyle} from 'src/components/backstage/widgets/text_box/text_box';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {buildQuery} from 'src/hooks';
import {formatName, getTextWidth} from 'src/helpers';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import withAdditionalProps from 'src/components/hoc/with_additional_props';

import {SelectObject} from 'src/types/object_select';

import GraphNodeType, {markNodesAndEdges} from './graph_node_type';
import GraphNodeInfo, {NODE_INFO_ID_PREFIX} from './graph_node_info';

type GraphStyle = {
    containerDirection: string,
    graphWidth: string;
    graphHeight: string;
    textBoxStyle?: TextBoxStyle;
};

type GraphSidebarStyle = {
    width: string;
};

type Props = {
    data: GraphData;
    direction: GraphDirection;
    name: string;
    sectionId: string;
    parentId: string;
    setDirection: Dispatch<SetStateAction<GraphDirection>>;
};

const DESCRIPTION_ID_PREFIX = 'graph-';

// Pixels between each levels in the graph
const GRAP_RANK_SEP = 85;

// This is the style for the dashboard
const defaultGraphStyle: GraphStyle = {
    containerDirection: 'row',
    graphWidth: '75%',
    graphHeight: '50vh',
    textBoxStyle: {
        height: '5vh',
        marginTop: '72px',

        // width: '25%',
    },
};

const rhsGraphStyle: GraphStyle = {
    containerDirection: 'column',
    graphWidth: '100%',
    graphHeight: '40vh',
    textBoxStyle: {
        marginTop: '62px',
    },
};

const defaultGraphSidebarStyle: GraphSidebarStyle = {
    width: '25%',
};

const rhsGraphSidebarStyle: GraphSidebarStyle = {
    width: '100%',
};

const fitViewOptions: FitViewOptions = {
    padding: 1,
};

const hideOptions = {
    hideAttribution: true,
};

const minimapStyle = {
    height: 90,
    width: 180,
};

const isDescriptionProvided = ({name, text}: GraphDescription) => {
    return name !== '' && text !== '';
};

export const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    direction: GraphDirection = Direction.HORIZONTAL,
) => {
    // We need to create a new Dagre instance here because
    // if done globally, the RHS would create problem when calculating positions.
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    if (!nodes || !edges) {
        return {nodes: [], edges: []};
    }
    g.setGraph({rankdir: direction, ranksep: GRAP_RANK_SEP});
    nodes.forEach((node) => g.setNode(node.id, node));
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    Dagre.layout(g, {ranksep: GRAP_RANK_SEP});

    return {
        nodes: nodes.map((node) => {
            const isHorizontal = direction === Direction.HORIZONTAL;
            node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
            node.targetPosition = isHorizontal ? Position.Left : Position.Top;

            const width = getTextWidth(node.data.label) + 40;
            const height = 42;

            let {x, y} = g.node(node.id);
            if (!node.width || !node.height) {
                x = x < 0 ? x + 60 : x * 5;
                y *= 2;
            }
            x -= (node.width ? node.width / 2 : width / 2);
            y -= (node.height ? node.height / 2 : height / 2);
            node.width = node.width ? node.width : width;
            node.height = node.height ? node.height : height;
            return {
                ...node,
                position: {
                    x: x > 0 ? x + 100 : x,
                    y,
                },
            };
        }),
        edges,
    };
};

const Graph = ({
    data,
    direction,
    name,
    sectionId,
    parentId,
    setDirection,
}: Props) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const isRhsClosed = useContext(IsRhsClosedContext);
    const isRhs = useContext(IsRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const {hash: sectionUrlHash} = useLocation();
    const {fitView, getNode, setViewport} = useReactFlow();
    const {formatMessage} = useIntl();
    const [targetNode, setTargetNode] = useState<Node | undefined>();
    const [selectedObject, setSelectedObject] = useState<SelectObject|null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [nodeInfo, setNodeInfo] = useState<NodeInfo | undefined>();
    const channelId = useSelector(getCurrentChannelId);
    const setTargetNodeId = useCallback((nodeId: string) => {
        const node = getNode(nodeId);
        if (node) {
            setTargetNode(node);
        }
    }, []);

    useEffect(() => {
        setNodeInfo(undefined);
        setIsDrawerOpen(false);
        setTargetNode(undefined);
        setViewport({x: 0, y: 0, zoom: 0.6});
    }, [channelId]);

    const nodeTypes = useMemo(() => ({graphNodeType: withAdditionalProps(GraphNodeType, {setNodeInfo, setTargetNodeId, setIsDrawerOpen})}), []);

    const [description, setDescription] = useState<GraphDescription>(emptyDescription);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const toggleDirection = (dir: GraphDirection): GraphDirection => {
        return dir === Direction.HORIZONTAL ? Direction.VERTICAL : Direction.HORIZONTAL;
    };

    const onLayout = useCallback((dir: GraphDirection) => {
        if (dir === direction) {
            return;
        }

        const layouted = getLayoutedElements(nodes, edges, dir);
        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);
        setDirection(dir);

        window.requestAnimationFrame(() => {
            fitView();
        });
    }, [nodes, edges]);

    useEffect(() => {
        setDescription(data.description || emptyDescription);

        // Ignore node properties such as position which can change due to a scroll event happening - we only care about a structural update (new/deleted nodes)
        const oldNodes = nodes.map((node) => node.id);
        const newNodes = (data.nodes || []).map((node) => node.id);

        if (!isEqual(oldNodes, newNodes) || !isEqual(edges, data.edges)) {
            setNodes(data.nodes || []);
            setEdges(data.edges || []);
        }

        // Set a target node to center the viewport on, if there's one associated to the hash in the url.
        const urlHashedNode = data.nodes.find((node) => node.data.isUrlHashed);
        if (urlHashedNode?.id === targetNode?.id) {
            return;
        }
        if (!urlHashedNode && targetNode) {
            // When following a hyperlink, the data can be reset and due to the sectionid being stripped from the url post-navigation
            // the urlHashed node loses its isUrlHashed property. We still have a targetNode reference though, so we sync them again
            markNodesAndEdges(nodes, edges, targetNode);
            setNodes([...nodes]);
            setEdges([...edges]);
        }
    }, [data]);

    useEffect(() => {
        if (targetNode?.id !== selectedObject?.value) {
            setSelectedObject(null);
        }
        if (targetNode) {
            markNodesAndEdges(nodes, edges, targetNode);
            setNodes([...nodes]);
            setEdges([...edges]);
            fitView({nodes: [targetNode], maxZoom: 0.6});
        }
    }, [targetNode]);

    useEffect(() => {
        if (sectionUrlHash) {
            const urlHashedNode = data.nodes.find((node) => sectionUrlHash.includes(node.id));

            // The target node is also resetted if the section hash refers to a non-node element
            setTargetNode(urlHashedNode);
        }

        if (sectionUrlHash.includes(NODE_INFO_ID_PREFIX)) {
            // We assume ids are unique across nodes and sections
            // #identity--588fa371-4527-4fef-8499-14383fa7a29d-cb55b098-4c1d-4bfe-86ec-923a5e8933af-16-node-info--widget to nodeId-sectionid-parentid
            const nodeId = sectionUrlHash.
                split(NODE_INFO_ID_PREFIX)[0].
                slice(1, -1);
            const hashedNode = data.nodes.find((node) => nodeId.includes(node.id));
            if (hashedNode !== undefined) {
                setIsDrawerOpen(true);
                setNodeInfo({name: hashedNode.data.label, description: hashedNode.data.description, nodeId});
            }
        }
    }, [sectionUrlHash, data]);

    // const getGraphStyle = useCallback<() => GraphStyle>((): GraphStyle => {
    //     const graphStyle = (isRhsClosed && isRhs) || !isDescriptionProvided(description) ? rhsGraphStyle : defaultGraphStyle;
    //     const {graphHeight: graphHeightVh} = graphStyle;
    //     if (!graphHeightVh.includes('vh')) {
    //         return graphStyle;
    //     }
    //     const vh = window.innerHeight;
    //     const graphHeightVhAsNumber = parseInt(graphHeightVh.substring(0, graphHeightVh.indexOf('vh')), 10);
    //     const heightPixels = (vh * graphHeightVhAsNumber) / 100;
    //     const graphHeight = `${heightPixels}px`;
    //     return {...graphStyle, graphHeight};
    // }, []);

    // const graphStyle = getGraphStyle();
    const graphStyle = (isRhsClosed && isRhs) ? rhsGraphStyle : defaultGraphStyle;
    const graphSidebarStyle = (isRhsClosed && isRhs) ? rhsGraphSidebarStyle : defaultGraphSidebarStyle;

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;

    const onChange = (nodeId: string) => {
        const target = data.nodes.find((node) => node.id === nodeId);
        setSelectedObject(nodeId ? {value: nodeId, label: target?.data.label} : null);
        if (target !== undefined) {
            setTargetNode(target);
        }
    };
    const filterOption = (input: string, option?: { label: string; value: string }) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    return (
        <Container
            containerDirection={graphStyle.containerDirection}
        >
            <GraphContainer
                id={id}
                data-testid={id}
                width={graphStyle.graphWidth}
                height={graphStyle.graphHeight}
            >
                <Header>
                    <AnchorLinkTitle
                        fullUrl={fullUrl}
                        id={id}
                        query={isEcosystemRhs ? '' : buildQuery(parentId, sectionId)}
                        text={name}
                        title={name}
                    />
                </Header>
                <StyledSelect
                    value={selectedObject?.value}
                    showSearch={true}
                    placeholder='Select a node'
                    optionFilterProp='children'
                    onChange={onChange}
                    filterOption={filterOption}
                    options={data.nodes.map((node) => {
                        return {value: node.id, label: node.data.label};
                    })}
                />
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView={true}
                    fitViewOptions={fitViewOptions}
                    proOptions={hideOptions}
                >
                    <Background/>
                    <Controls/>
                    <MiniMap
                        style={minimapStyle}
                        zoomable={true}
                        pannable={true}
                    />
                    <Panel position={panelPosition}>
                        <Tooltip
                            title={formatMessage({defaultMessage: 'Toggle graph direction'})}
                            placement='bottom'
                        >
                            <Button
                                icon={<PartitionOutlined/>}
                                onClick={() => onLayout(toggleDirection(direction))}
                            />
                        </Tooltip>
                    </Panel>
                </ReactFlow>
            </GraphContainer>
            <Drawer
                title={nodeInfo?.name}
                placement='right'
                onClose={() => {
                    setIsDrawerOpen(false);
                }}
                open={isDrawerOpen}
                size='large'
            >
                {nodeInfo &&
                <GraphNodeInfo
                    info={nodeInfo}
                    sectionId={sectionId}
                    parentId={parentId}
                />}
            </Drawer>
            <GraphSidebar
                width={graphSidebarStyle.width}
                noMargin={(isRhsClosed && isRhs) ?? false}
            >
                {isDescriptionProvided(description) &&
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={description.name}
                        sectionId={sectionId}
                        style={graphStyle.textBoxStyle}
                        parentId={parentId}
                        text={description.text}
                    />
                }
            </GraphSidebar>
        </Container>
    );
};

const GraphContainer = styled.div<{width: string, height: string}>`
    width: ${(props) => props.width};
    height: ${(props) => props.height};
    margin-bottom: 24px;
`;

const Container = styled.div<{containerDirection: string}>`
    width: 100%;
    display: flex;
    flex-direction: ${(props) => props.containerDirection};
    margin-top: 24px;
    margin-bottom: 36px;
`;

const GraphSidebar = styled.div<{width: string, noMargin: boolean}>`
    width: ${(props) => props.width};
    display: flex;
    flex-direction: column;
    margin-left: ${(props) => (props.noMargin ? '' : '16px')};
`;

const StyledSelect = styled(Select)`
    width: 100%;
    margin-bottom: 12px;
` as typeof Select;

export default Graph;
