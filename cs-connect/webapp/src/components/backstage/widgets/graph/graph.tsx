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
    EdgeChange,
    FitViewOptions,
    MiniMap,
    Node,
    NodeChange,
    Panel,
    Position,
    applyEdgeChanges,
    applyNodeChanges,
    useReactFlow,
} from 'reactflow';
import styled from 'styled-components';
import Dagre from 'dagre';
import {Button, Tooltip} from 'antd';
import {PartitionOutlined} from '@ant-design/icons';
import {useIntl} from 'react-intl';
import {getCurrentChannelId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';
import {useSelector} from 'react-redux';

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

import GraphNodeType from './graph_node_type';
import GraphNodeInfo from './graph_node_info';

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
const GRAP_RANK_SEP = 75;

// This is the style for the dashboard
const defaultGraphStyle: GraphStyle = {
    containerDirection: 'row',
    graphWidth: '75%',
    graphHeight: '50vh',
    textBoxStyle: {
        height: '5vh',
        marginTop: '24px',

        // width: '25%',
    },
};

const rhsGraphStyle: GraphStyle = {
    containerDirection: 'column',
    graphWidth: '100%',
    graphHeight: '40vh',
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
    const {fitView} = useReactFlow();
    const {formatMessage} = useIntl();

    const [nodeInfo, setNodeInfo] = useState<NodeInfo | undefined>();
    const channelId = useSelector(getCurrentChannelId);
    useEffect(() => {
        setNodeInfo(undefined);
    }, [channelId]);

    const nodeTypes = useMemo(() => ({graphNodeType: withAdditionalProps(GraphNodeType, {setNodeInfo})}), []);

    const [description, setDescription] = useState<GraphDescription>(emptyDescription);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

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
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
    }, [data]);

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

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
            <GraphSidebar width={graphSidebarStyle.width}>
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
                {nodeInfo &&
                    <GraphNodeInfo
                        info={nodeInfo}
                        setNodeInfo={setNodeInfo}
                        sectionId={sectionId}
                        parentId={parentId}
                    />}
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
`;

const GraphSidebar = styled.div<{width: string}>`
    width: ${(props) => props.width};
    display: flex;
    flex-direction: column;
    margin-left: 12px;
`;

export default Graph;
