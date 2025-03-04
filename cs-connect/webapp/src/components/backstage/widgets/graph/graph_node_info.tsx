import {Dropdown, MenuProps} from 'antd';
import React, {
    Dispatch,
    FC,
    ReactNode,
    SetStateAction,
    useContext,
} from 'react';
import styled from 'styled-components';
import {
    CloseOutlined,
    InfoCircleOutlined,
    LinkOutlined,
    NodeIndexOutlined,
} from '@ant-design/icons';
import {FormattedMessage} from 'react-intl';

import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {EMPTY_NODE_DESCRIPTION, GraphNodeInfo as NodeInfo} from 'src/types/graph';
import {VerticalSpacer} from 'src/components/backstage/grid';
import {IsRhsClosedContext} from 'src/components/rhs/rhs';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';

import {IsEcosystemGraphViewContext} from './graph';

export const NODE_INFO_ID_PREFIX = 'node-info-';

type Props = {
    info: NodeInfo;
    sectionId: string;
    parentId: string;
    graphName: string;
};

const textBoxStyle = {
    height: '5vh',
    marginTop: '0px',
};

const getNodeTypeFromKind = (kind: string | undefined, isEcosystemGraphView: boolean): string => {
    if (!kind || kind === 'default') {
        if (isEcosystemGraphView) {
            return 'Please choose another type, this node still has a \'default\' type';
        }
        return 'The type has not been specified yet.';
    }
    if (kind === 'rectangle') {
        return 'Organization';
    }
    if (kind === 'oval') {
        return 'Service';
    }
    return kind;
};

// To add more sections, be sure to also update the suggestions
// parsers to properly add hyperlinking functionality.
const GraphNodeInfo: FC<Props> = ({
    info,
    sectionId,
    parentId,
    graphName,
}) => {
    const isEcosystemGraphView = useContext(IsEcosystemGraphViewContext);
    const isRhs = useContext(IsRhsContext);
    const isRhsClosed = useContext(IsRhsClosedContext);

    const {
        name,
        kind,
        description,
        contacts,
        collaborationPolicies,
        ecosystemOrganization,
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
    } = info;

    return (
        <Container>
            <TextBox
                name={'Description'}
                sectionId={sectionId}
                parentId={parentId}
                text={description ?? EMPTY_NODE_DESCRIPTION}
                style={textBoxStyle}
                customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-desc-widget`}
                titleText={`${graphName}.${name}.Description`}
            />

            {(isEcosystemGraphView) &&
                <TextBox
                    name={'Contacts'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={contacts ?? 'No contacts provided.'}
                    style={{marginTop: '48px'}}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-contacts-widget`}
                    titleText={`${graphName}.${name}.Contacts`}
                />}
            {(isEcosystemGraphView) &&
                <TextBox
                    name={'Collaboration Policies'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={collaborationPolicies ?? 'No collaboration policies provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-collabopols-widget`}
                    titleText={`${graphName}.${name}.CollaborationPolicies`}
                />}
            {(isEcosystemGraphView && kind === 'rectangle') &&
                <TextBox
                    name={'Ecosystem Organization'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={ecosystemOrganization ?? 'The status has not been selected yet.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-ecoorg-widget`}
                    titleText={`${graphName}.${name}.EcosystemOrganization`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'Criticality Level'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${criticalityLevel}` || 'No criticality level provided.'}
                    style={{marginTop: '48px'}}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-critlevel-widget`}
                    titleText={`${graphName}.${name}.CriticalityLevel`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'Service Level Agreement'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${serviceLevelAgreement}` || 'No service level agreement provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-sla-widget`}
                    titleText={`${graphName}.${name}.ServiceLevelAgreement`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'BC/DR Description'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${bcdrDescription}` || 'No BC/DR description provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-bcdrdesc-widget`}
                    titleText={`${graphName}.${name}.BCDRDescription`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'RTO'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${rto}` || 'No RTO provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-rto-widget`}
                    titleText={`${graphName}.${name}.RTO`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'RPO'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${rpo}` || 'No RPO provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-rpo-widget`}
                    titleText={`${graphName}.${name}.RPO`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'Confidentiality Level'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${confidentialityLevel}` || 'No confidentiality level provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-confidentialityLevel-widget`}
                    titleText={`${graphName}.${name}.ConfidentialityLevel`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'Integrity Level'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${integrityLevel}` || 'No integrity level provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-integrityLevel-widget`}
                    titleText={`${graphName}.${name}.IntegrityLevel`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'Availability Level'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${availabilityLevel}` || 'No availability level provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-availabilityLevel-widget`}
                    titleText={`${graphName}.${name}.AvailabilityLevel`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'CIA Rationale'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${ciaRationale}` || 'No CIA rationale provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-ciaRationale-widget`}
                    titleText={`${graphName}.${name}.CIARationale`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'MTPD'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${mtpd}` || 'No MTPD provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-mtpd-widget`}
                    titleText={`${graphName}.${name}.MTPD`}
                />}
            {(isEcosystemGraphView && kind === 'oval') &&
                <TextBox
                    name={'Real-time Status'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${realtimeStatus}` || 'No real-time status provided.'}
                    customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-realtimeStatus-widget`}
                    titleText={`${graphName}.${name}.RealtimeStatus`}
                />}

            <TextBox
                name={'Type'}
                sectionId={sectionId}
                parentId={parentId}
                style={{
                    marginTop: isEcosystemGraphView ? '24px' : '48px',
                }}
                text={getNodeTypeFromKind(kind, isEcosystemGraphView)}
                customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-type-widget`}
                titleText={`${graphName}.${name}.Type`}
            />

            {(isRhs && isRhsClosed) && <VerticalSpacer size={24}/>}
        </Container>
    );
};

type GraphNodeInfoDropdown = {
    onInfoClick: () => void;
    onCopyLinkClick: () => void;
    onViewConnectionsClick: () => void;
    children: ReactNode;
    trigger?: ('contextMenu' | 'click' | 'hover')[] | undefined;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export const GraphNodeInfoDropdown: FC<GraphNodeInfoDropdown> = ({
    onInfoClick,
    onCopyLinkClick,
    onViewConnectionsClick,
    children,
    trigger = ['click'],
    open = false,
    setOpen,
}) => {
    const items: MenuProps['items'] = [
        {
            key: 'copy-link',
            label: (
                <div
                    onClick={onCopyLinkClick}
                >
                    <LinkOutlined/> <FormattedMessage defaultMessage={'Copy link'}/>
                </div>
            ),
        },
        {
            key: 'info',
            label: (
                <div
                    onClick={onInfoClick}
                >
                    <InfoCircleOutlined/> <FormattedMessage defaultMessage={'View info'}/>
                </div>
            ),
        },
        {
            key: 'view-connections',
            label: (
                <div
                    onClick={onViewConnectionsClick}
                >
                    <NodeIndexOutlined/> <FormattedMessage defaultMessage={'View connections'}/>
                </div>
            ),
        },
        {
            key: 'close-menu',
            danger: true,
            label: (
                <div
                    onClick={() => setOpen(false)}
                >
                    <CloseOutlined/> <FormattedMessage defaultMessage={'Close menu'}/>
                </div>
            ),
        },
    ];
    return (
        <Dropdown
            open={open}
            trigger={trigger}
            menu={{items}}
            arrow={{pointAtCenter: true}}
            placement='topLeft'
        >
            {children}
        </Dropdown>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
    margin-bottom: 24px;
`;

export default GraphNodeInfo;
