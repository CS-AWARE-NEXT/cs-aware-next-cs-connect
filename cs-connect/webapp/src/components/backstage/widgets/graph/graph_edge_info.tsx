import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {EMPTY_EDGE_DESCRIPTION, GraphEdgeInfo as EdgeInfo} from 'src/types/graph';
import {VerticalSpacer} from 'src/components/backstage/grid';
import {IsRhsClosedContext} from 'src/components/rhs/rhs';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';

import {IsEcosystemGraphViewContext} from './graph';
import {EDGE_TYPE_COOPERATING_WITH, EDGE_TYPE_MANAGED_BY, EDGE_TYPE_SUPPLIED_BY} from './editable_graph';

export const EDGE_INFO_ID_PREFIX = 'edge-info-';

type Props = {
    info: EdgeInfo;
    sectionId: string;
    parentId: string;
    graphName: string;
};

const textBoxStyle = {
    marginTop: '0px',
};

const getEdgeTypeFromKind = (kind: string | undefined): string => {
    const defaultType = 'Please choose another type, this edge still has a \'default\' type';
    if (!kind) {
        return defaultType;
    }
    if (kind === EDGE_TYPE_SUPPLIED_BY) {
        return 'Supplied By';
    }
    if (kind === EDGE_TYPE_MANAGED_BY) {
        return 'Managed By';
    }
    if (kind === EDGE_TYPE_COOPERATING_WITH) {
        return 'Cooperating With';
    }
    return defaultType;
};

// To add more sections, be sure to also update the suggestions parsers to properly add hyperlinking functionality.
const GraphEdgeInfo: FC<Props> = ({
    info,
    sectionId,
    parentId,
    graphName,
}) => {
    const isEcosystemGraphView = useContext(IsEcosystemGraphViewContext);
    const isRhs = useContext(IsRhsContext);
    const isRhsClosed = useContext(IsRhsClosedContext);

    const {
        description,
        criticalityLevel,
        serviceLevelAgreement,
        bcdrDescription,
        rto,
        rpo,
        confidentialityLevel,
        integrityLevel,
        availabilityLevel,
        ciaRationale,
        mtpd,
        realtimeStatus,
        kind,
    } = info;

    return (
        <Container>
            <TextBox
                name={'Description'}
                sectionId={sectionId}
                parentId={parentId}
                text={description ?? EMPTY_EDGE_DESCRIPTION}
                style={textBoxStyle}
                customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-desc-widget`}
                titleText={`${graphName}.Edge.Description`}
            />

            {(isEcosystemGraphView) &&
                <TextBox
                    name={'Criticality Level'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${criticalityLevel}` || 'No criticality level provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-critlevel-widget`}
                    titleText={`${graphName}.Edge.CriticalityLevel`}
                />}
            {(isEcosystemGraphView && kind === EDGE_TYPE_SUPPLIED_BY) &&
                <TextBox
                    name={'Service Level Agreement'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={serviceLevelAgreement || 'No service level agreement provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-sla-widget`}
                    titleText={`${graphName}.Edge.ServiceLevelAgreement`}
                />}
            {(isEcosystemGraphView && kind === EDGE_TYPE_SUPPLIED_BY) &&
                <TextBox
                    name={'BC/DR Description'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={bcdrDescription || 'No BC/DR description provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-bcdrdesc-widget`}
                    titleText={`${graphName}.Edge.BCDRDescription`}
                />}
            {(isEcosystemGraphView && kind === EDGE_TYPE_SUPPLIED_BY) &&
                <TextBox
                    name={'RTO'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={rto || 'No RTO provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-rto-widget`}
                    titleText={`${graphName}.Edge.RTO`}
                />}
            {(isEcosystemGraphView && kind === EDGE_TYPE_SUPPLIED_BY) &&
                <TextBox
                    name={'RPO'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={rpo || 'No RPO provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-rpo-widget`}
                    titleText={`${graphName}.Edge.RPO`}
                />}
            {(isEcosystemGraphView && kind === EDGE_TYPE_SUPPLIED_BY) &&
                <TextBox
                    name={'Confidentiality Level'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${confidentialityLevel}` || 'No confidentiality level provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-confidentialityLevel-widget`}
                    titleText={`${graphName}.Edge.ConfidentialityLevel`}
                />}
            {(isEcosystemGraphView && kind === EDGE_TYPE_SUPPLIED_BY) &&
                <TextBox
                    name={'Integrity Level'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${integrityLevel}` || 'No integrity level provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-integrityLevel-widget`}
                    titleText={`${graphName}.Edge.IntegrityLevel`}
                />}
            {(isEcosystemGraphView && kind === EDGE_TYPE_SUPPLIED_BY) &&
                <TextBox
                    name={'Availability Level'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${availabilityLevel}` || 'No availability level provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-availabilityLevel-widget`}
                    titleText={`${graphName}.Edge.AvailabilityLevel`}
                />}
            {(isEcosystemGraphView && kind === EDGE_TYPE_SUPPLIED_BY) &&
                <TextBox
                    name={'CIA Rationale'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={ciaRationale || 'No CIA rationale provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-ciaRationale-widget`}
                    titleText={`${graphName}.Edge.CIARationale`}
                />}
            {(isEcosystemGraphView && kind === EDGE_TYPE_SUPPLIED_BY) &&
                <TextBox
                    name={'MTPD'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={mtpd || 'No MTPD provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-mtpd-widget`}
                    titleText={`${graphName}.Edge.MTPD`}
                />}
            {(isEcosystemGraphView && kind === EDGE_TYPE_SUPPLIED_BY) &&
                <TextBox
                    name={'Real-time Status'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={realtimeStatus || 'No real-time status provided.'}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-realtimeStatus-widget`}
                    titleText={`${graphName}.Edge.RealtimeStatus`}
                />}

            {(isEcosystemGraphView) &&
                <TextBox
                    name={'Type'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={getEdgeTypeFromKind(kind)}
                    customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-type-widget`}
                    titleText={`${graphName}.Edge.Type`}
                />}

            {(isRhs && isRhsClosed) && <VerticalSpacer size={24}/>}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
    margin-bottom: 24px;
`;

export default GraphEdgeInfo;
