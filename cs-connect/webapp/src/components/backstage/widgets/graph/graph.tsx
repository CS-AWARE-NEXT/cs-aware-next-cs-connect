import 'reactflow/dist/style.css';
import React, {
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
    applyEdgeChanges,
    applyNodeChanges,
} from 'reactflow';
import styled from 'styled-components';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext, IsRhsClosedContext} from 'src/components/rhs/rhs';
import {GraphData, GraphDescription, emptyDescription} from 'src/types/graph';
import TextBox, {TextBoxStyle} from 'src/components/backstage/widgets/text_box/text_box';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {buildQuery} from 'src/hooks';
import {formatName} from 'src/helpers';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';

import GraphNodeType from './graph_node_type';

type GraphStyle = {
    containerDirection: string,
    graphWidth: string;
    graphHeight: string;
    textBoxStyle?: TextBoxStyle;
};

type Props = {
    data: GraphData;
    name: string;
    sectionId: string;
    parentId: string;
};

const DESCRIPTION_ID_PREFIX = 'graph-';

const defaultGraphStyle: GraphStyle = {
    containerDirection: 'row',
    graphWidth: '75%',
    graphHeight: '40vh',
    textBoxStyle: {
        height: '5vh',
        marginTop: '0px',
        width: '25%',
    },
};

const rhsGraphStyle: GraphStyle = {
    containerDirection: 'column',
    graphWidth: '100%',
    graphHeight: '40vh',
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

const Graph = ({
    data,
    name,
    sectionId,
    parentId,
}: Props) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const isRhsClosed = useContext(IsRhsClosedContext);
    const isRhs = useContext(IsRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const nodeTypes = useMemo(() => ({graphNodeType: GraphNodeType}), []);
    const [description, setDescription] = useState<GraphDescription>(emptyDescription);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        setDescription(data.description || emptyDescription);
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
    }, [data]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

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
    const graphStyle = (isRhsClosed && isRhs) || !isDescriptionProvided(description) ? rhsGraphStyle : defaultGraphStyle;

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
                </ReactFlow>
            </GraphContainer>
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

export default Graph;
