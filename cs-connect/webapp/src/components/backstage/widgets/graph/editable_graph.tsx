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
    Button,
    Divider,
    Drawer,
    Input,
    Layout,
    Select,
    Tooltip,
} from 'antd';
import {Content} from 'antd/es/layout/layout';
import Sider from 'antd/es/layout/Sider';

import styled from 'styled-components';

import {HelpIcon} from '@mattermost/compass-icons/components';

import withAdditionalProps from 'src/components/hoc/with_additional_props';

import {uuidv4} from 'src/helpers/uuid';

import {LockStatus} from 'src/types/ecosystem_graph';

import GraphNodeType, {edgeType, nodeType} from './graph_node_type';
import CustomEdge from './graph_edge_type';

export const EDGE_TYPE_MANAGED_BY = 'managed-by';
export const EDGE_TYPE_SUPPLIED_BY = 'supplied-by';

const minimapStyle = {
    height: 90,
    width: 180,
};

type NodeSelectionData = {
    id: string,
    label: string,
    description: string,
    kind: string,
};
type EdgeSelectionData = {
    id: string,
    kind: string,
};
type GraphData = {
    nodes: Node[],
    edges: Edge[],
}

const defaultNodeSelectionData = {id: '', label: '', description: '', kind: ''};
const defaultEdgeSelectionData = {id: '', kind: ''};
const RESET_LOCK_DELAY = 60000; // 1 minute

/**
 * className: used to style the graph through styled-components
 * existingNodes: provide default nodes to render. If empty, a single root node will automatically be added.
 * existingEdges: provide default edges to render.
 * setUpdatedData: allows notifying the parent that the nodes and/or edges have been updated. The persistence logic is supposed to be handled by the parent based on the usecase.
 * setIsEditing: allows notifying the parent that the user wants to enable the edit mode. The parent can run validation checks such as locking mechanisms before allowing editing the graph.
 * triggerUpdate: allows notifying the parent that its current updated data should be persisted. This callback is associated to a Save button.
 * lockStatus: Toggles the status of the edit button, disabling it if the lock cannot be acquired.
 * resetLockStatus: resets the lock to NotRequested
 * refreshNodeInternals: exposes a simplified proxy of React Flow updateNodeInternals in case the parent container has some animation. This must be called on any animation end (such as for modals), else edges will render incorrectly and will not connect to node anchors.
 */
type Props = {
    className?: string,
    existingNodes: Node[],
    existingEdges: Edge[],
    setUpdatedData: React.Dispatch<React.SetStateAction<GraphData>>,
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>,
    triggerUpdate: () => void,
    lockStatus: LockStatus,
    resetLockStatus: () => void,
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
    resetLockStatus,
    refreshNodeInternals,
}: Props) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const store = useStoreApi();
    const connectingNodeId = useRef<string | null>(null);
    const {screenToFlowPosition, flowToScreenPosition, setViewport} = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    const editEnabled = lockStatus === LockStatus.Acquired;
    const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);

    const [nodeSelectionData, setNodeSelectionData] = useState<NodeSelectionData>(defaultNodeSelectionData);
    const [edgeSelectionData, setEdgeSelectionData] = useState<EdgeSelectionData>(defaultEdgeSelectionData);

    // Refresh node internals if the parent finished some animation
    useEffect(() => {
        updateNodeInternals(nodes.map((node) => node.id));
    }, [refreshNodeInternals]);

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
    const onEdgeClick = useCallback((id: string, kind: string) => {
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
        setEdgeSelectionData({
            id,
            kind,
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
            data: {
                label: 'New Node',
                description: '',
                kind: 'default',
            },
            position,
            parentNode: parentNode.id,
        };

        const newEdge = {
            id: uuidv4(),
            source: parentNode.id,
            target: newNode.id,
            type: edgeType,
            data: {
                kind: EDGE_TYPE_MANAGED_BY,
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
                data: {
                    kind: EDGE_TYPE_MANAGED_BY,
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
        if (currentNodeIds.length !== 0 && currentNodeIds.length === parentNodeIds.length && currentNodeIds.every((value, index) => value === parentNodeIds[index])) {
            return;
        }

        // Allow updates from parent if the graph is empty
        if (nodes.length < 2) {
            if (existingNodes.length) {
                setNodes(existingNodes);
                setEdges(existingEdges);
                setUpdatedData({nodes: [...existingNodes], edges: [...existingEdges]});
                setViewport({x: 0, y: 0, zoom: 1}, {duration: 800});
            } else {
                // Always keep a non deletable root node to allow creating more nodes from it
                const startingNode = {
                    id: 'root',
                    type: nodeType,
                    data: {
                        label: 'New node',
                        kind: 'cloud',
                        description: '',
                    },
                    position: {x: 0, y: 0},
                };
                setNodes([startingNode]);
                setEdges([]);
                setUpdatedData({nodes: [startingNode], edges: []});
            }
        }
    }, [existingNodes, existingEdges, editEnabled]);

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
                if (newData.delete) {
                    result = result.filter((n) => n.id !== node.id);
                }
                result.forEach((n) => {
                    if (n.id === node.id) {
                        n.data = {...n.data, ...newData};
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
        setEdges((eds) => {
            let result = eds;
            if (newData.delete) {
                result = result.filter((e) => e.id !== edgeSelectionData.id);
            }
            result.forEach((edge) => {
                if (edge.id === edgeSelectionData.id) {
                    edge.data = {...edge.data, ...newData};
                }
            });
            setUpdatedData((updatedData) => ({nodes: updatedData.nodes, edges: [...result]}));
            return [...result];
        });
        setEdgeSelectionData(newData.delete ? defaultEdgeSelectionData : {
            id: edgeSelectionData.id,
            kind: newData.kind || '',
        });
    }, [edgeSelectionData, setEdges, editEnabled]);

    // Re-enable the edit button after a delay if it was disabled due to the lock being busy
    useEffect(() => {
        let timeoutID: NodeJS.Timeout;
        if (lockStatus === LockStatus.Busy) {
            timeoutID = setTimeout(() => {
                resetLockStatus();
            }, RESET_LOCK_DELAY);
        }
        return () => {
            clearTimeout(timeoutID);
        };
    }, [lockStatus]);

    return (
        <Layout
            className={className}
            style={{width: '95%'}}
        >
            <Content>
                <Drawer
                    title={'Ecosystem graph help'}
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
                >
                    <Background/>
                    <Controls>
                        <ControlButton onClick={() => setHelpDrawerOpen(true)}>
                            <HelpIcon/>
                        </ControlButton>
                    </Controls>
                    <MiniMap
                        style={minimapStyle}
                        zoomable={true}
                        pannable={true}
                    />
                </ReactFlow>
            </Content>
            <Sider
                theme={'light'}
                style={{paddingLeft: '15px'}}
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
                        <StyledButton
                            type='primary'
                            block={true}
                            onClick={() => {
                                triggerUpdate();
                            }}
                        >
                            {'Save'}
                        </StyledButton>
                        <InputLabel>{'You are now editing the ecosystem graph. When you are finished, click the Save button to make changes persistent.'}</InputLabel>
                    </>
                )}
                <Divider/>
                {nodeSelectionData !== defaultNodeSelectionData && (
                    <>
                        <InputLabel>{'Node Name'}</InputLabel>
                        <Input
                            placeholder='Name'
                            value={nodeSelectionData.label}
                            disabled={!editEnabled}
                            onChange={(e) => {
                                updateNodeData({label: e.target.value});
                            }}
                        />
                        <InputLabel>{'Node Description'}</InputLabel>
                        <Input
                            placeholder='Description'
                            value={nodeSelectionData.description}
                            disabled={!editEnabled}
                            onChange={(e) => {
                                updateNodeData({description: e.target.value});
                            }}
                        />
                        <InputLabel>{'Node Type'}</InputLabel>
                        <Select
                            defaultValue='default'
                            value={nodeSelectionData.kind}
                            style={{width: '100%'}}
                            disabled={!editEnabled}
                            options={[
                                {value: 'default', label: 'default'},
                                {value: 'database', label: 'database'},
                                {value: 'cloud', label: 'cloud'},
                                {value: 'network', label: 'network'},
                            ]}
                            onChange={(value) => {
                                updateNodeData({kind: value});
                            }}
                        />
                        <StyledButton
                            type='primary'
                            danger={true}
                            block={true}
                            disabled={!editEnabled || nodeSelectionData.id === 'root'}
                            onClick={() => {
                                updateNodeData({delete: true});
                            }}
                        >
                            {'Delete'}
                        </StyledButton>
                    </>
                )}
                {edgeSelectionData !== defaultEdgeSelectionData && (
                    <>
                        <InputLabel>{'Edge Kind'}</InputLabel>
                        <Select
                            defaultValue={EDGE_TYPE_MANAGED_BY}
                            value={edgeSelectionData.kind}
                            style={{width: '100%'}}
                            disabled={!editEnabled}
                            options={[
                                {value: EDGE_TYPE_MANAGED_BY, label: 'Managed by'},
                                {value: EDGE_TYPE_SUPPLIED_BY, label: 'Supplied by'},
                            ]}
                            onChange={(value) => {
                                updateEdgeData({kind: value});
                            }}
                        />
                        <StyledButton
                            type='primary'
                            danger={true}
                            block={true}
                            disabled={!editEnabled}
                            onClick={() => {
                                updateEdgeData({delete: true});
                            }}
                        >
                            {'Delete'}
                        </StyledButton>
                    </>
                )}
                {nodeSelectionData === defaultNodeSelectionData && edgeSelectionData === defaultEdgeSelectionData && (
                    <InputLabel>{'Select a node or an edge to view or edit its information.'}</InputLabel>
                )}
            </Sider>
        </Layout>
    );
};

const StyledButton = styled(Button)`
	margin-top: 10px;
	border-radius: 0px;
`;

const InputLabel = styled.h4`
`;

export default React.memo(EditableGraph);
