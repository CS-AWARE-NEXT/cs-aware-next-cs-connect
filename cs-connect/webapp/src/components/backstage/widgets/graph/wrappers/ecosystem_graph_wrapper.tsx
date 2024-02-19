import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';
import {Edge, Node, ReactFlowProvider} from 'reactflow';

import {getCurrentUserId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';

import {useSelector} from 'react-redux';

import styled from 'styled-components';

import {FullUrlContext, SectionContext} from 'src/components/rhs/rhs';
import Graph, {getLayoutedElements} from 'src/components/backstage/widgets/graph/graph';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {Direction, GraphData, GraphDirection} from 'src/types/graph';

import {fillEdges, fillNodes} from 'src/components/backstage/widgets/graph/graph_node_type';

import EditableGraph from 'src/components/backstage/widgets/graph/editable_graph';
import {dropEcosystemGraphLock, refreshEcosystemGraphLock} from 'src/clients';
import {LockStatus} from 'src/types/ecosystem_graph';
import {getSystemConfig} from 'src/config/config';
import {useEcosystemGraphData} from 'src/hooks';
import Loading from 'src/components/commons/loading';

type Props = {
    name?: string;
    editable?: boolean;
    className?: string;
    url: string;
    refreshNodeInternals?: Record<string, never>,
};

const EcosystemGraphWrapper = ({
    name = 'Graph',
    editable,
    className,
    url,
    refreshNodeInternals,
}: Props) => {
    const fullUrl = useContext(FullUrlContext);
    const sectionContextOptions = useContext(SectionContext);
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const userID = useSelector(getCurrentUserId);
    const [serverGraphData, setServerGraphData] = useEcosystemGraphData(url);
    const [updatedData, setUpdatedData] = useState<GraphData>({nodes: [], edges: []});
    const [isEditing, setIsEditing] = useState(false);
    const [lockStatus, setLockStatus] = useState(LockStatus.NotRequested);
    const systemConfig = getSystemConfig();

    // a ref is needed to always use the newest data between intervals: https://stackoverflow.com/questions/70471250/settimeout-function-in-useeffect-outputs-a-cached-state-value
    const updatedDataRef = useRef(updatedData);

    const {url: routeUrl, params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {search} = useLocation();

    const [direction, setDirection] = useState<GraphDirection>(Direction.VERTICAL);

    const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;
    const isFullUrlProvided = fullUrl !== '';
    const sectionUrl = isFullUrlProvided ? fullUrl : routeUrl;

    const resetLockStatus = useCallback(() => {
        setLockStatus(LockStatus.NotRequested);
    }, []);

    // Fill non persistent node and edge metadata for nodes and edges loaded from the data provider
    useEffect(() => {
        const mappedNodes = serverGraphData && serverGraphData.nodes ? serverGraphData.nodes.map((ecosystemNode) => {
            return {...ecosystemNode, data: {label: ecosystemNode.name, description: ecosystemNode.description, kind: ecosystemNode.type}} as unknown;
        }) as Node[] : [];
        const mappedEdges = serverGraphData && serverGraphData.edges ? serverGraphData.edges.map((ecosystemEdge) => {
            return {...ecosystemEdge, source: ecosystemEdge.sourceNodeID, target: ecosystemEdge.destinationNodeID, data: {kind: ecosystemEdge.kind}} as unknown;
        }) as Edge[] : [];

        const filledNodes = fillNodes(mappedNodes, {
            applyOptions: !isEcosystemRhs,
            parentId,
            sectionId: sectionIdForUrl,
            sectionUrl,
        });
        const filledEdges = fillEdges(mappedEdges, true);
        const {nodes, edges} = getLayoutedElements(filledNodes, filledEdges, direction);
        setUpdatedData({nodes, edges});
    }, [serverGraphData]);

    // Refresh lock and persist the graph
    const refreshLockAndUpdateGraph = useCallback((manual?: boolean) => {
        if (editable && isEditing) {
            let mappedData;
            if (systemConfig.ecosystemGraphAutoSave || manual) {
                mappedData = {
                    nodes: updatedDataRef.current.nodes.map((node) => ({
                        id: node.id,
                        name: node.data.label,
                        description: node.data.description,
                        type: node.data.kind,
                    })),
                    edges: updatedDataRef.current.edges.map((edge) => ({
                        id: edge.id,
                        sourceNodeID: edge.source,
                        destinationNodeID: edge.target,
                        kind: edge.data.kind,
                    })),
                };
            }
            (async () => {
                const lockAcquired = await refreshEcosystemGraphLock(url, userID, systemConfig.ecosystemGraphAutoSaveDelay, mappedData);
                setLockStatus(lockAcquired ? LockStatus.Acquired : LockStatus.Busy);
                if (lockAcquired) {
                    if (systemConfig.ecosystemGraphAutoSave || manual) {
                        setServerGraphData(mappedData);
                    }
                } else {
                    setIsEditing(false);
                }
            })();
        }
    }, [editable, isEditing, url]);

    // Periodically refresh the lock based on the delay specified in the system config.
    useEffect(() => {
        let intervalID: number;
        if (editable && isEditing && serverGraphData) {
            (async () => {
                const lockAcquired = await refreshEcosystemGraphLock(url, userID, systemConfig.ecosystemGraphAutoSaveDelay);
                setLockStatus(lockAcquired ? LockStatus.Acquired : LockStatus.Busy);
                if (!lockAcquired) {
                    setIsEditing(false);
                }
                if (lockAcquired) {
                    intervalID = window.setInterval(refreshLockAndUpdateGraph, systemConfig.ecosystemGraphAutoSaveDelay * 1000 * 60);
                }
            })();
        }
        return () => {
            if (editable && isEditing) {
                // Perform a final save
                refreshLockAndUpdateGraph();
                clearInterval(intervalID);
                dropEcosystemGraphLock(url, userID);
            }
        };
    }, [refreshLockAndUpdateGraph, editable, isEditing]);

    useEffect(() => {
        updatedDataRef.current = updatedData;
    }, [updatedData]);

    return (
        serverGraphData === undefined ? <Loading/> : (
            <ReactFlowProvider>
                {editable ? (
                    <EditableGraph
                        className={className}
                        existingNodes={updatedData.nodes}
                        existingEdges={updatedData.edges}
                        setUpdatedData={setUpdatedData}
                        setIsEditing={setIsEditing}
                        triggerUpdate={() => {
                            refreshLockAndUpdateGraph(true);
                        }}
                        lockStatus={lockStatus}
                        resetLockStatus={resetLockStatus}
                        refreshNodeInternals={refreshNodeInternals}
                    />
                ) : (
                    <Graph
                        data={{nodes: updatedData.nodes, edges: updatedData.edges}}
                        direction={direction}
                        name={name}
                        sectionId={sectionIdForUrl}
                        parentId={parentId}
                        setDirection={setDirection}
                    />)
                }
            </ReactFlowProvider>
        )
    );
};

// This is specifically used in the EcosystemGraphEditor which embeds the graph in a modal.
// But if you move this definition there, it apparently creates a circular dependency breaking everything.
// I'm honestly not sure why this being here prevents the problem, blame React/Webpack/JavaScript
export const StyledEcosystemGraphWrapper = styled(EcosystemGraphWrapper)`
height: 100%;
`;

export default EcosystemGraphWrapper;
