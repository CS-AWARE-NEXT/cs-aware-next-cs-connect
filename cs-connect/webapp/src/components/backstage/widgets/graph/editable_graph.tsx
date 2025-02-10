import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import ReactFlow, {
    Background,
    Connection,
    ControlButton,
    Controls,
    Edge,
    MarkerType,
    MiniMap,
    Node,
    OnConnectEnd,
    OnConnectStart,
    XYPosition,
    addEdge,
    useEdgesState,
    useNodesState,
    useReactFlow,
    useStoreApi,
    useUpdateNodeInternals,
} from 'reactflow';
import {
    Alert,
    Button,
    Drawer,
    Dropdown,
    Layout,
    Tooltip,
} from 'antd';
import {LeftOutlined, RightOutlined} from '@ant-design/icons';
import {Content} from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';
import styled from 'styled-components';

import withAdditionalProps from 'src/components/hoc/with_additional_props';
import {uuidv4} from 'src/helpers/uuid';
import {LockStatus} from 'src/types/ecosystem_graph';
import {getSystemConfig} from 'src/config/config';

import GraphNodeType, {edgeType, nodeType} from './graph_node_type';
import CustomEdge from './graph_edge_type';
import EdgeSidebar from './edge_sidebar';
import NodeSidebar from './node_sidebar';

const ON_CREATION_NODE_TYPE = 'default';
export const EDGE_TYPE_MANAGED_BY = 'managed-by';
export const EDGE_TYPE_SUPPLIED_BY = 'supplied-by';
export const EDGE_TYPE_COOPERATING_WITH = 'cooperating-with';
export const EDGE_TYPE_OPERATED_BY = 'operated-by';
export const EDGE_TYPE_SUPPORTED_BY = 'supported-by';

const minimapStyle = {
    height: 90,
    width: 180,
};

const hideOptions = {
    hideAttribution: true,
};

export type NodeSelectionData = {
    id: string,
    label: string,
    description: string,
    kind: string,
    ecosystemOrganization?: string,
};

export type EdgeSelectionData = {
    id: string,
    kind: string,
    description?: string,
};

type GraphData = {
    nodes: Node[],
    edges: Edge[],
}

enum SaveType {
    Save,
    SaveAndClose,
    CloseWithoutSaving,
}

// IMPORTANT: add here extra node data info
const defaultNodeSelectionData = {
    id: '',
    label: '',
    description: '',
    kind: '',
};

// IMPORTANT: add here extra edge data info
const defaultEdgeSelectionData = {
    id: '',
    description: '',
    kind: '',
};

/**
 * className: used to style the graph through styled-components
 * existingNodes: provide default nodes to render. If empty, a single root node will automatically be added.
 * existingEdges: provide default edges to render.
 * setUpdatedData: allows notifying the parent that the nodes and/or edges have been updated. The persistence logic is supposed to be handled by the parent based on the usecase.
 * setIsEditing: allows notifying the parent that the user wants to enable the edit mode. The parent can run validation checks such as locking mechanisms before allowing editing the graph.
 * triggerUpdate: allows notifying the parent that its current updated data should be persisted. This callback is associated to a Save button.
 * lockStatus: Toggles the status of the edit button, disabling it if the lock cannot be acquired.
 * refreshNodeInternals: exposes a simplified proxy of React Flow updateNodeInternals in case the parent container has some animation. This must be called on any animation end (such as for modals), else edges will render incorrectly and will not connect to node anchors.
 */
type Props = {
    className?: string,
    existingNodes: Node[],
    existingEdges: Edge[],
    setUpdatedData: React.Dispatch<React.SetStateAction<GraphData>>,
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
    triggerUpdate: (save: boolean, close: boolean) => void,
    lockStatus: LockStatus,
    refreshNodeInternals?: Record<string, never>,
};

const EditableGraph = ({
    className,
    existingNodes,
    existingEdges,
    setUpdatedData,
    setIsEditing,
    triggerUpdate,
    lockStatus,
    refreshNodeInternals,
}: Props) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const store = useStoreApi();
    const connectingNodeId = useRef<string | null>(null);
    const {screenToFlowPosition, setViewport} = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    const editEnabled = lockStatus === LockStatus.Acquired;
    const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
    const [savedTooltipOpen, setSavedTooltipOpen] = useState(false);
    const [resetNodes, setResetNodes] = useState(false);
    const [hideSidebar, setHideSidebar] = useState(false);

    const [nodeSelectionData, setNodeSelectionData] = useState<NodeSelectionData>(defaultNodeSelectionData);
    const [edgeSelectionData, setEdgeSelectionData] = useState<EdgeSelectionData>(defaultEdgeSelectionData);
    const systemConfig = getSystemConfig();
    const saveActions = systemConfig.ecosystemGraphAutoSave ? [
        {
            key: '1',
            label: 'Save and stop editing',
        },
    ] : [
        {
            key: '1',
            label: 'Save and stop editing',
        },
        {
            key: '2',
            label: 'Stop editing without saving',
        },
    ];

    // Refresh node internals if the parent finished some animation
    useEffect(() => {
        updateNodeInternals(nodes.map((node) => node.id));
        setResetNodes(true);
    }, [refreshNodeInternals]);

    const save = useCallback((saveType: SaveType) => {
        setSavedTooltipOpen(true);
        const timeoutID = setTimeout(() => {
            setSavedTooltipOpen(false);
        }, 2000);

        switch (saveType) {
        case SaveType.Save:
            triggerUpdate(true, false);
            break;
        case SaveType.SaveAndClose:
            triggerUpdate(true, true);
            break;
        case SaveType.CloseWithoutSaving:
            triggerUpdate(false, true);
            setNodeSelectionData(defaultNodeSelectionData);
            setEdgeSelectionData(defaultEdgeSelectionData);
            break;
        }
        return () => {
            clearTimeout(timeoutID);
        };
    }, [triggerUpdate]);

    // Highlight clicked nodes (and disable the highlight on all the other elements)
    const onNodeClick = useCallback((id: string) => {
        const {nodeInternals} = store.getState();
        const targetNode = nodeInternals.get(id);
        if (targetNode) {
            setNodes((nds) => {
                nds.forEach((node) => {
                    node.data = {...node.data, isUrlHashed: false};
                    if (node.id === id) {
                        node.data = {...node.data, isUrlHashed: true};
                    }
                });
                return [...nds];
            });
            setEdges((eds) => {
                eds.forEach((edge) => {
                    edge.data = {...edge.data, isUrlHashed: false};
                });
                return [...eds];
            });

            // IMPORTANT: add here extra node data info
            setNodeSelectionData({
                id,
                label: targetNode.data.label || '',
                description: targetNode.data.description || '',
                kind: targetNode.data.kind || '',
            });
            setEdgeSelectionData(defaultEdgeSelectionData);
        }
    }, []);

    // Highlight clicked edges (and disable the highlight on all the other elements)
    const onEdgeClick = useCallback((
        id: string,
        kind: string,
        description: string | undefined,
    ) => {
        setNodes((nds) => {
            nds.forEach((node) => {
                node.data = {...node.data, isUrlHashed: false};
            });
            return [...nds];
        });
        setEdges((eds) => {
            eds.forEach((edge) => {
                edge.data = {...edge.data, isUrlHashed: false};
                if (edge.id === id) {
                    edge.data = {...edge.data, isUrlHashed: true};
                }
            });
            return [...eds];
        });
        setNodeSelectionData(defaultNodeSelectionData);

        // IMPORTANT: add here extra edge data info
        setEdgeSelectionData({
            id,
            kind,
            description,
        });
    }, [edges, setEdges]);

    const nodeTypes = useMemo(() => ({graphNodeType: withAdditionalProps(GraphNodeType, {onNodeClick})}), []);
    const edgeTypes = useMemo(() => ({step: withAdditionalProps(CustomEdge, {onEdgeClick})}), []);

    // convert screen to react flow coordinates (relative to a parent node), used to create nodes when releasing an edge on the canvas
    const getChildNodePosition = useCallback((event: MouseEvent, parentNode?: Node): XYPosition => {
        const {domNode} = store.getState();

        if (
            !domNode ||

            // we need to check if these properites exist, because when a node is not initialized yet,
            // it doesn't have a positionAbsolute nor a width or height
            !parentNode?.positionAbsolute ||
            !parentNode?.width ||
            !parentNode?.height
        ) {
            return {x: 0, y: 0};
        }

        const panePosition = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        return {
            x: (panePosition.x - parentNode.positionAbsolute.x) - (parentNode.width / 2),
            y: (panePosition.y - parentNode.positionAbsolute.y) - (parentNode.height / 2),
        };
    }, [store, screenToFlowPosition]);

    // Create a node relative to an existing one and connect the two
    const addChildNode = (parentNode: Node, position: XYPosition) => {
        if (!editEnabled) {
            return;
        }
        const newNode = {
            id: uuidv4(),
            type: nodeType,

            // IMPORTANT: add here extra node data info
            data: {
                label: 'New Node',
                description: '',
                kind: ON_CREATION_NODE_TYPE, // this is the default kind (Organization)
            },
            position,
            parentNode: parentNode.id,
        };

        const newEdge = {
            id: uuidv4(),
            source: parentNode.id,
            target: newNode.id,
            type: edgeType,

            // IMPORTANT: add here extra edge data info
            data: {
                kind: EDGE_TYPE_MANAGED_BY,
                description: '',
            },
            markerEnd: {
                type: MarkerType.Arrow,
                height: 20,
                width: 20,
            },
        };

        setNodes([...nodes, newNode]);
        setEdges([...edges, newEdge]);

        setUpdatedData((updatedData) => {
            return {nodes: [...updatedData.nodes, newNode], edges: [...updatedData.edges, newEdge]};
        });
    };

    // Edge creation with an arrow mark and proper styling
    const onConnect = useCallback(
        (params: Connection) => {
            if (!editEnabled) {
                return;
            }

            // reset the start node on connections
            connectingNodeId.current = null;
            const newEdge = {
                id: uuidv4(),
                source: params.source || '',
                target: params.target || '',
                type: edgeType,

                // IMPORTANT: add here extra edge data info
                data: {
                    kind: EDGE_TYPE_MANAGED_BY,
                    description: '',
                },
                markerEnd: {
                    type: MarkerType.Arrow,
                    height: 20,
                    width: 20,
                },
            };
            setEdges((eds) => addEdge(newEdge, eds));
            setUpdatedData((updatedData) => ({nodes: updatedData.nodes, edges: [...updatedData.edges, newEdge]}));
        },
        [editEnabled],
    );

    const onConnectStart: OnConnectStart = useCallback((_, {nodeId}) => {
        connectingNodeId.current = nodeId;
    }, []);

    const onConnectEnd: OnConnectEnd = useCallback((event) => {
        const {nodeInternals} = store.getState();

        // we only want to create a new node if the connection ends on the pane
        const targetIsPane = (event.target as Element).classList.contains(
            'react-flow__pane',
        );

        if (targetIsPane && connectingNodeId.current) {
            const parentNode = nodeInternals.get(connectingNodeId.current);
            const childNodePosition = getChildNodePosition(event as MouseEvent, parentNode);

            if (parentNode && childNodePosition && editEnabled) {
                addChildNode(parentNode, childNodePosition);
            }
        }
    }, [getChildNodePosition, editEnabled, addChildNode]);

    useEffect(() => {
        const currentNodeIds = nodes.map((node) => node.id);
        const parentNodeIds = existingNodes.map((node) => node.id);

        // Prevent infinite loop if the parent data contains no change
        if (!resetNodes && (currentNodeIds.length !== 0 && currentNodeIds.length === parentNodeIds.length && currentNodeIds.every((value, index) => value === parentNodeIds[index]))) {
            return;
        }

        // Allow updates from parent if the graph is empty
        if (nodes.length < 2 || resetNodes) {
            setResetNodes(false);
            if (existingNodes.length) {
                setNodes(existingNodes);
                setEdges(existingEdges);
                setUpdatedData({nodes: [...existingNodes], edges: [...existingEdges]});
                setViewport({x: 0, y: 0, zoom: 1}, {duration: 800});
            } else {
                // Always keep a non deletable root node to allow creating more nodes from it
                const startingNode = {
                    id: 'default-node',
                    type: nodeType,
                    data: {
                        label: 'Start node',
                        kind: 'rectangle',
                        description: 'Start working on the graph by customizing this node.',
                    },
                    position: {x: 0, y: 0},
                };
                setNodes([startingNode]);
                setEdges([]);
                setUpdatedData({nodes: [startingNode], edges: []});
            }
        }
    }, [existingNodes, existingEdges, editEnabled, resetNodes]);

    const updateNodeData = useCallback((newData) => {
        if (!editEnabled) {
            return;
        }
        const {nodeInternals} = store.getState();
        const node = nodeInternals.get(nodeSelectionData.id);

        if (node) {
            if (newData.delete) {
                nodeInternals.delete(nodeSelectionData.id);
                setNodeSelectionData(defaultNodeSelectionData);
                setEdges((eds) => {
                    return [...eds.filter((e) => e.source !== node.id && e.target !== node.id)];
                });
            } else {
                // Update the internal react flow node to properly display changes
                node.data = {...node.data, ...newData};

                // Update the input field
                setNodeSelectionData({
                    id: node.id,
                    label: node.data.label || '',
                    description: node.data.description || '',
                    kind: node.data.kind || '',
                });
            }

            // and update the nodes store so that the changes are permanent
            setNodes((nds) => {
                let result = nds;
                let ancestor_id: string|undefined;
                if (newData.delete) {
                    ancestor_id = result.find((n) => n.id === node.id)?.parentNode;
                    result = result.filter((n) => n.id !== node.id);
                }
                result.forEach((n) => {
                    if (n.id === node.id) {
                        n.data = {...n.data, ...newData};
                    }
                    if (newData.delete && n.parentNode === node.id) {
                        if (ancestor_id) {
                            n.parentNode = ancestor_id;
                        } else {
                            delete n.parentNode;
                        }
                    }
                });
                setUpdatedData((updatedData) => ({nodes: [...result], edges: updatedData.edges.filter((e) => !newData.delete || (e.source !== node.id && e.target !== node.id))}));
                return [...result];
            });
        }
    }, [nodeSelectionData.id, nodes, setNodes, store, editEnabled]);

    const updateEdgeData = useCallback((newData) => {
        if (!editEnabled) {
            return;
        }

        // used to keep track of edge's data to update the edgeSelectionData
        let edgeData: any = {};
        setEdges((eds) => {
            let result = eds;
            if (newData.delete) {
                result = result.filter((e) => e.id !== edgeSelectionData.id);
            }
            result.forEach((edge) => {
                if (edge.id === edgeSelectionData.id) {
                    edge.data = {...edge.data, ...newData};
                    edgeData = {...edge.data};
                }
            });
            setUpdatedData((updatedData) => ({nodes: updatedData.nodes, edges: [...result]}));
            return [...result];
        });

        // IMPORTANT: add here extra edge data info
        setEdgeSelectionData(newData.delete ? defaultEdgeSelectionData : {
            id: edgeSelectionData.id,
            kind: edgeData.kind || '',
            description: edgeData.description || '',
        });
    }, [edgeSelectionData, setEdges, editEnabled]);

    return (
        <Flex>
            <RightElements>
                {hideSidebar ?
                    <Tooltip title='Open sidebar'>
                        <StyledButton
                            type='default'
                            icon={<LeftOutlined/>}
                            block={true}
                            onClick={() => {
                                setHideSidebar(false);
                            }}
                            style={{
                                width: '50px',
                                border: 'none',
                            }}
                        />
                    </Tooltip> :
                    <Tooltip title='Close sidebar'>
                        <StyledButton
                            type='default'
                            icon={<RightOutlined/>}
                            block={true}
                            onClick={() => {
                                setHideSidebar(true);
                            }}
                            style={{
                                width: '50px',
                                border: 'none',
                            }}
                        />
                    </Tooltip>
                }
            </RightElements>

            <Layout
                className={className}
                style={{width: '100%'}}
            >
                <Content>
                    <Drawer
                        title={'Ecosystem Graph Help'}
                        open={helpDrawerOpen}
                        onClose={() => setHelpDrawerOpen(false)}
                    >
                        <p>{`
                            This view allows you to edit the ecosystem graph.
                        `}</p>
                        <p>{`
                            To enable the edit mode, press the "Turn on edit mode" button. This will give you unique edit access to the graph, so that others won't be able to make changes at the same time.
                        `}</p>
                        <p>{`
                            You can create a new node by starting an edge from an existing node (by pressing the left click mouse button on a node anchor point) and releasing the left mouse button somewhere on the graph canvas.
                        `}</p>
                        <p>{`
                            You can also create new edges between existing nodes in a similar way, by simply releasing the left mouse button on another node's anchor point.
                        `}</p>
                        <p>{`
                            By clicking on a node or on an edge info button (the "i" at the center of the edge), you will be able to view and edit its associated information from the right sidebar. The selected node or edge will be highlighted in yellow.
                        `}</p>
                        <p>{`
                            The graph will be automatically saved periodically to prevent losing data.
                        `}</p>
                        <p>{`
                            Node and edge positions will not be persisted. Instead, a proper layout for the whole graph will automatically be calculated.
                        `}</p>
                        <p>{`
                            You can use the "Save" button in the sidebar to trigger a manual save. Be sure to save before closing the browser or leaving the page!
                        `}</p>
                    </Drawer>

                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        fitView={true}
                        onlyRenderVisibleElements={false}
                        proOptions={hideOptions}
                    >
                        <Background/>
                        <Controls>
                            <ControlButton onClick={() => setHelpDrawerOpen(true)}>
                                <i className='icon fa fa-info'/>
                            </ControlButton>
                        </Controls>
                        <MiniMap
                            style={minimapStyle}
                            zoomable={true}
                            pannable={true}
                        />
                    </ReactFlow>
                </Content>

                {!hideSidebar &&
                    <CustomSider
                        theme='light'
                        width='20%'

                        // collapsible={true}
                        // defaultCollapsed={false}

                        // style={{
                        //     paddingLeft: '8px',
                        //     overflow: 'scroll',
                        //     width: '100%',
                        // }}
                    >
                        {!editEnabled && (
                            <Tooltip title={lockStatus === LockStatus.Busy ? 'The ecosystem graph is being edited by someone else. Try again in a few minutes.' : ''}>
                                <StyledButton
                                    type='primary'
                                    block={true}
                                    disabled={lockStatus === LockStatus.Busy}
                                    onClick={() => {
                                        setIsEditing(true);
                                    }}
                                >
                                    {'Edit'}
                                </StyledButton>
                            </Tooltip>
                        )}
                        {editEnabled && (
                            <>

                                <StyledDropdownButton
                                    type='primary'
                                    onClick={() => save(SaveType.Save)}
                                    menu={{items: saveActions,
                                        onClick: (e) => {
                                            switch (e.key) {
                                            case '1':
                                                save(SaveType.SaveAndClose);
                                                break;
                                            case '2':
                                                save(SaveType.CloseWithoutSaving);
                                                break;
                                            }
                                        }}}
                                    buttonsRender={([leftButton, rightButton]) => [
                                        <Tooltip
                                            key={'leftButton'}
                                            title='Saved!'
                                            trigger='click'
                                            open={savedTooltipOpen}
                                        >
                                            {React.cloneElement(leftButton as React.ReactElement<any, string>, {block: true})}
                                        </Tooltip>,
                                        rightButton,
                                    ]}
                                >
                                    {'Save'}
                                </StyledDropdownButton>
                                {/* <Alert
                                    message='You are in edit mode'
                                    description='Rememeber to save when you are finished.'
                                    type='warning'
                                    showIcon={true}
                                    style={{marginTop: '10px'}}
                                /> */}
                            </>
                        )}

                        {/* <Divider/> */}

                        {nodeSelectionData !== defaultNodeSelectionData && (
                            <NodeSidebar
                                editEnabled={editEnabled}
                                nodeSelectionData={nodeSelectionData}
                                updateNodeData={updateNodeData}
                            />
                        )}

                        {edgeSelectionData !== defaultEdgeSelectionData && (
                            <EdgeSidebar
                                editEnabled={editEnabled}
                                edgeSelectionData={edgeSelectionData}
                                updateEdgeData={updateEdgeData}
                            />
                        )}

                        {nodeSelectionData === defaultNodeSelectionData && edgeSelectionData === defaultEdgeSelectionData && (
                            <Alert
                                message='Select a node/edge to view/edit.'
                                type='info'
                                showIcon={true}
                                style={{marginTop: '20px'}}
                            />
                        )}
                    </CustomSider>
                }
            </Layout>
        </Flex>
    );
};

export const StyledButton = styled(Button)`
	margin-top: 10px;

	/* border-radius: 0px; */
`;

const StyledDropdownButton = styled(Dropdown.Button)`
	margin-top: 10px;

    /* border-radius: 0px; */
`;

const Flex = styled.div`
    display: flex;
    flex-direction: column;
`;

const RightElements = styled.div`
    display: flex;
    flex-direction: row-reverse;

    margin-right: 12px;
`;

const CustomSider = styled(Sider)`
    padding-left: 10px;
    padding-right: 8px;

    overflow: scroll;
    width: 100%;

    &::-webkit-scrollbar {
        width: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #888;
        border-radius: 8px;
        border: 4px solid transparent;
        background-clip: padding-box;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }
`;

export default React.memo(EditableGraph);
