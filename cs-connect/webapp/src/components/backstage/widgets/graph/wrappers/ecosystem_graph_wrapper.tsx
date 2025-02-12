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

const RESET_LOCK_DELAY = 60000; // 1 minute

type Props = {
    name?: string;
    editable?: boolean;
    className?: string;
    url?: string;
    refreshNodeInternalsParent?: Record<string, never>,
    setEditMode?: React.Dispatch<React.SetStateAction<boolean>>,
};

const EcosystemGraphWrapper = ({
    name = 'Graph',
    editable,
    className,
    url = '',
    refreshNodeInternalsParent,
    setEditMode,
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
    const autoSaveDelay = Math.max(systemConfig.ecosystemGraphAutoSaveDelay, 1);
    const [intervalID, setIntervalID] = useState<number>();

    // Trigger a graph refresh if either our parent signals a layout change (e.g. modal animation) or if we do (e.g. resetting nodes after closing edit mode)
    const [refreshNodeInternals, setRefreshNodeInternals] = useState(refreshNodeInternalsParent);

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

    const resetData = useCallback(() => {
        // IMPORTANT: Add all extra information in the node's data
        const mappedNodes = serverGraphData && serverGraphData.nodes ? serverGraphData.nodes.map((ecosystemNode) => {
            return {
                ...ecosystemNode,
                data: {
                    label: ecosystemNode.name,
                    description: ecosystemNode.description,
                    kind: ecosystemNode.type,
                    contacts: ecosystemNode.contacts,
                    collaborationPolicies: ecosystemNode.collaborationPolicies,
                    criticalityLevel: ecosystemNode.criticalityLevel,
                    serviceLevelAgreement: ecosystemNode.serviceLevelAgreement,
                    bcdrDescription: ecosystemNode.bcdrDescription,
                    rto: ecosystemNode.rto,
                    rpo: ecosystemNode.rpo,
                    confidentialityLevel: ecosystemNode.confidentialityLevel,
                    integrityLevel: ecosystemNode.integrityLevel,
                    availabilityLevel: ecosystemNode.availabilityLevel,
                    ciaRationale: ecosystemNode.ciaRationale,
                    mtpd: ecosystemNode.mtpd,
                    realtimeStatus: ecosystemNode.realtimeStatus,
                    ecosystemOrganization: ecosystemNode.ecosystemOrganization,
                },
            } as unknown;
        }) as Node[] : [];

        // IMPORTANT: Add all extra information in the edge's data
        const mappedEdges = serverGraphData && serverGraphData.edges ? serverGraphData.edges.map((ecosystemEdge) => {
            return {
                ...ecosystemEdge,
                source: ecosystemEdge.sourceNodeID,
                target: ecosystemEdge.destinationNodeID,
                data: {
                    kind: ecosystemEdge.kind,
                    description: ecosystemEdge.description,
                    criticalityLevel: ecosystemEdge.criticalityLevel,
                    serviceLevelAgreement: ecosystemEdge.serviceLevelAgreement,
                    bcdrDescription: ecosystemEdge.bcdrDescription,
                    rto: ecosystemEdge.rto,
                    rpo: ecosystemEdge.rpo,
                    confidentialityLevel: ecosystemEdge.confidentialityLevel,
                    integrityLevel: ecosystemEdge.integrityLevel,
                    availabilityLevel: ecosystemEdge.availabilityLevel,
                    ciaRationale: ecosystemEdge.ciaRationale,
                    mtpd: ecosystemEdge.mtpd,
                    realtimeStatus: ecosystemEdge.realtimeStatus,
                },
            } as unknown;
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
    }, [direction, isEcosystemRhs, parentId, sectionIdForUrl, sectionUrl, serverGraphData, serverGraphData?.nodes, serverGraphData?.edges]);

    const refreshLock = useCallback(() => {
        (async () => {
            const lockAcquired = await refreshEcosystemGraphLock(url, userID, autoSaveDelay);
            setLockStatus(lockAcquired ? LockStatus.Acquired : LockStatus.Busy);
            if (!lockAcquired) {
                setIsEditing(false);
            }
        })();
    }, [systemConfig.ecosystemGraphAutoSaveDelay, url, userID]);

    const updateGraph = useCallback(async (close?: boolean) => {
        const mappedData = {

            // IMPORTANT: add here extra node data info
            nodes: updatedDataRef.current.nodes.map((node) => ({
                id: node.id,
                name: node.data.label,
                description: node.data.description,
                type: node.data.kind,
                contacts: node.data.contacts,
                collaborationPolicies: node.data.collaborationPolicies,
                criticalityLevel: node.data.criticalityLevel,
                serviceLevelAgreement: node.data.serviceLevelAgreement,
                bcdrDescription: node.data.bcdrDescription,
                rto: node.data.rto,
                rpo: node.data.rpo,
                confidentialityLevel: node.data.confidentialityLevel,
                integrityLevel: node.data.integrityLevel,
                availabilityLevel: node.data.availabilityLevel,
                ciaRationale: node.data.ciaRationale,
                mtpd: node.data.mtpd,
                realtimeStatus: node.data.realtimeStatus,
                ecosystemOrganization: node.data.ecosystemOrganization || 'no',
            })),

            // IMPORTANT: add here extra edge data info
            edges: updatedDataRef.current.edges.map((edge) => ({
                id: edge.id,
                sourceNodeID: edge.source,
                destinationNodeID: edge.target,
                kind: edge.data.kind,
                description: edge.data.description,
                criticalityLevel: edge.data.criticalityLevel,
                serviceLevelAgreement: edge.data.serviceLevelAgreement,
                bcdrDescription: edge.data.bcdrDescription,
                rto: edge.data.rto,
                rpo: edge.data.rpo,
                confidentialityLevel: edge.data.confidentialityLevel,
                integrityLevel: edge.data.integrityLevel,
                availabilityLevel: edge.data.availabilityLevel,
                ciaRationale: edge.data.ciaRationale,
                mtpd: edge.data.mtpd,
                realtimeStatus: edge.data.realtimeStatus,
            })),
        };
        const lockAcquired = await refreshEcosystemGraphLock(url, userID, autoSaveDelay, mappedData);
        if (close) {
            await dropEcosystemGraphLock(url, userID);
            setLockStatus(LockStatus.NotRequested);
            setIsEditing(false);
        } else {
            setLockStatus(lockAcquired ? LockStatus.Acquired : LockStatus.Busy);
            if (lockAcquired) {
                setServerGraphData(mappedData);
            } else {
                setIsEditing(false);
            }
        }
    }, [setServerGraphData, systemConfig.ecosystemGraphAutoSaveDelay, url, userID]);

    const closeEditMode = useCallback(async (reset: boolean) => {
        await dropEcosystemGraphLock(url, userID);
        setLockStatus(LockStatus.NotRequested);
        setIsEditing(false);
        if (reset) {
            resetData();
            setRefreshNodeInternals({});
        }
    }, [resetData, url, userID]);

    // Fill non persistent node and edge metadata for nodes and edges loaded from the data provider
    useEffect(() => {
        resetData();
    }, [serverGraphData]);

    // Notify the parent of a change in edit mode, for example to add safety checks before allowing exiting the window
    useEffect(() => {
        if (setEditMode) {
            setEditMode(isEditing);
        }
    }, [isEditing]);

    // Re-enable the edit button after a delay if it was disabled due to the lock being busy
    useEffect(() => {
        let timeoutID: NodeJS.Timeout;
        if (lockStatus === LockStatus.Busy) {
            timeoutID = setTimeout(() => {
                setLockStatus(LockStatus.NotRequested);
            }, RESET_LOCK_DELAY);
        }
        return () => {
            clearTimeout(timeoutID);
        };
    }, [lockStatus]);

    // Periodically refresh the lock based on the delay specified in the system config.
    useEffect(() => {
        if (editable && isEditing && serverGraphData) {
            clearInterval(intervalID);
            refreshLock();
            if (systemConfig.ecosystemGraphAutoSave) {
                setIntervalID(window.setInterval(updateGraph, autoSaveDelay * 1000 * 60));
            } else {
                setIntervalID(window.setInterval(refreshLock, autoSaveDelay * 1000 * 60));
            }
        }
    }, [editable, isEditing]);

    // Clean up stuff when destroying the component
    useEffect(() => {
        return () => {
            if (editable) {
                clearInterval(intervalID);
                if (systemConfig.ecosystemGraphAutoSave) {
                    updateGraph(true);
                } else {
                    closeEditMode(true);
                }
            }
        };
    }, []);

    useEffect(() => {
        updatedDataRef.current = updatedData;
    }, [updatedData]);

    useEffect(() => {
        setRefreshNodeInternals(refreshNodeInternalsParent);
    }, [refreshNodeInternalsParent]);

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
                        triggerUpdate={(save: boolean, close: boolean) => {
                            if (save && close) {
                                updateGraph(true);
                            } else if (save) {
                                updateGraph();
                            } else if (close) {
                                closeEditMode(true);
                            } // both false is pointless
                        }}
                        lockStatus={lockStatus}
                        refreshNodeInternals={refreshNodeInternals}
                    />
                ) : (
                    <Graph
                        data={{nodes: updatedData.nodes, edges: updatedData.edges}}
                        direction={direction}
                        name={name}
                        sectionId={sectionIdForUrl}
                        parentId={parentId}
                        isEcosystemGraphView={true}
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
