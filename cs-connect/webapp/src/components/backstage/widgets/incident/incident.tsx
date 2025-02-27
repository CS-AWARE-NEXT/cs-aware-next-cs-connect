import React, {FC, useContext} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import moment from 'moment';
import {Alert, Tag} from 'antd';

import {Anomaly as AnomalyType, Incident as IncidentType} from 'src/types/incident';
import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {formatName} from 'src/helpers';
import {buildQuery, getUrlWithoutFragment, useOrganization} from 'src/hooks';
import {HorizontalSeparator, VerticalSpacer} from 'src/components/backstage/grid';
import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import GraphWrapper from 'src/components/backstage/widgets/graph/wrappers/graph_wrapper';
import Accordion from 'src/components/backstage/widgets/accordion/accordion';
import Loading from 'src/components/commons/loading';
import {CS_CONNECT_COMPLIANCE_OLD_VERSIONS} from 'src/constants';

import AnomalyAccordionChild from './anomaly_accordion_child';

const DESCRIPTION_ID_PREFIX = 'incident-details-';

type Props = {
    data: IncidentType;
    name: string;
    url?: string;
    parentId: string;
    sectionId: string;
    loading: boolean;
};

const Incident: FC<Props> = ({
    data,
    name = '',
    url = '',
    parentId,
    sectionId,
    loading,
}) => {
    const {formatMessage} = useIntl();

    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const isRhs = useContext(IsRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const organizationId = useContext(OrganizationIdContext);
    const organization = useOrganization(organizationId);
    const channelUrl = getUrlWithoutFragment();

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    // const anomaliesId = `${formatName(name)}-${sectionId}-${parentId}-widget-anomalies`;
    const anomaliesAccordionId = `anomalies-${sectionId}-${parentId}-widget`;

    const severity = data.severity ? `${data.severity}` : 'Severity is not available yet';
    const status = data.status || 'Status is not available yet';
    const attackType = data.attack_type || 'Attack Type is not available yet';
    const description = data.description || 'Description is not available yet';
    const notes = data.notes || 'Notes added by users will appear here';
    const bcdrStatus = data.bcdr_status || 'BCDR Status is not available yet';
    const contextStatus = data.context_status || 'Context Status is not available yet';

    // to use anomalies as elements in the accordion
    // name is currently different than the header because the hyperlinks would be too long otherwise
    const anomalyElements = data?.anomalies?.map((anomaly: AnomalyType) => {
        let anomalyName = 'Anomaly';
        let anomalyHeader = 'Anomaly';
        if (anomaly.type === 'lineguard') {
            anomalyName = `Anomaly at line ${anomaly.attributes.anomaly_details.line_number}`;
            anomalyHeader = `Anomaly at line ${anomaly.attributes.anomaly_details.line_number} of ${anomaly.attributes.anomaly_details.file_path}`;
        }
        return {
            anomaly,
            id: anomaly.id,
            header: anomalyHeader,
            name: anomalyName,
        };
    }) ?? [];

    // the incident container expects the url to be /details
    // and then converts it to be the graph url /graph
    const graphUrl = url.replace('details', 'graph');

    if (loading) {
        return <Loading marginTop='8px'/>;
    }

    if (data && data.reference_id === CS_CONNECT_COMPLIANCE_OLD_VERSIONS) {
        return (
            <NoIncidentContainer>
                <Alert
                    message={formatMessage({defaultMessage: 'This incidents does not exist in the data lake anymore.\nYou can archive this channel.'})}
                    type='info'
                    style={{marginTop: '8px'}}
                />
            </NoIncidentContainer>
        );
    }

    return (
        <Container data-testid={id}>
            <Header id={id}>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={isEcosystemRhs ? '' : ecosystemQuery}
                    text={name}
                    title={name}
                />
            </Header>

            <HorizontalContainer>
                <Tag
                    color='#cd201f'
                    style={{marginRight: '8px'}}
                >
                    {'Incident'}
                </Tag>
                {data.status &&
                    <Tag
                        color='#55acee'
                        style={{marginRight: '8px'}}
                    >
                        {data.status}
                    </Tag>
                }
                {data.attack_type &&
                    <Tag
                        color='#3b5999'
                        style={{marginRight: '8px'}}
                    >
                        {data.attack_type}
                    </Tag>
                }
                {data.bcdr_relevant &&
                    <Tag
                        color='brown'
                        style={{marginRight: '8px'}}
                    >
                        {'BCDR Relevant'}
                    </Tag>
                }
            </HorizontalContainer>

            {(isRhs && data.anomalies && data.anomalies.length > 0) &&
                <HorizontalContainer>
                    <a
                        style={{marginTop: '24px'}}
                        href={`${channelUrl}#${anomaliesAccordionId}`}
                        rel='noreferrer'
                    >
                        {`${formatMessage({defaultMessage: 'Go to Anomalies'})}`}
                    </a>
                </HorizontalContainer>
            }

            <TextBox
                idPrefix={DESCRIPTION_ID_PREFIX}
                name={formatMessage({defaultMessage: 'Severity'})}
                sectionId={sectionId}
                parentId={parentId}
                text={severity}
                opaqueText={true}
            />

            <HorizontalContainer>
                <TextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Status'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={status}
                    style={{marginTop: '24px', marginRight: '8px'}}
                    opaqueText={true}
                />
                <TextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Attack Type'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={attackType}
                    opaqueText={true}
                />
            </HorizontalContainer>

            <TextBox
                idPrefix={DESCRIPTION_ID_PREFIX}
                name={formatMessage({defaultMessage: 'Description'})}
                sectionId={sectionId}
                parentId={parentId}
                text={description}
                opaqueText={true}
            />

            <TextBox
                idPrefix={DESCRIPTION_ID_PREFIX}
                name={formatMessage({defaultMessage: 'Notes'})}
                sectionId={sectionId}
                parentId={parentId}
                text={notes}
                opaqueText={true}
            />

            {data.bcdr_relevant &&
                <TextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'BCDR Status'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={bcdrStatus}
                    opaqueText={true}
                />
            }

            <TextBox
                idPrefix={DESCRIPTION_ID_PREFIX}
                name={formatMessage({defaultMessage: 'Context Status'})}
                sectionId={sectionId}
                parentId={parentId}
                text={contextStatus}
                opaqueText={true}
            />

            <HorizontalContainer>
                <TextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Detected'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${moment(data.detected_time).format('MMMM Do YYYY, h:mm:ss a')}`}
                    style={{marginTop: '24px', marginRight: '8px'}}
                    opaqueText={true}
                />
                <TextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Modified'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${moment(data.modified_time).format('MMMM Do YYYY, h:mm:ss a')}`}
                    style={{marginTop: '24px', marginRight: '8px'}}
                    opaqueText={true}
                />
                <TextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Created'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${moment(data.created_time).format('MMMM Do YYYY, h:mm:ss a')}`}
                    opaqueText={true}
                />
            </HorizontalContainer>

            <VerticalSpacer size={12}/>
            <HorizontalSeparator/>

            {/* this is not needed before the graph */}
            {/* <VerticalSpacer size={12}/> */}

            <GraphWrapper
                name='System'
                url={graphUrl}
            />

            <VerticalSpacer size={12}/>
            <HorizontalSeparator/>

            {/* this is not needed if we use accordion */}
            {/* <VerticalSpacer size={12}/> */}

            {/* <Header id={anomaliesId}>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={anomaliesId}
                    query={isEcosystemRhs ? '' : ecosystemQuery}
                    text={'Anomalies'}
                    title={'Anomalies'}
                />
            </Header> */}

            {/* {(data.anomalies && data.anomalies.length > 0) && data.anomalies.map((anomaly) => (
                <>
                    <BorderBox border={true}>
                        <Anomaly
                            key={anomaly.id}
                            data={anomaly}
                            parentId={parentId}
                            sectionId={sectionId}
                        />
                    </BorderBox>
                    <VerticalSpacer size={24}/>
                </>
            ))} */}

            {(data.anomalies && data.anomalies.length > 0) && (
                <>
                    <Accordion
                        name={'Anomalies'}
                        withHeader={true}
                        childComponent={AnomalyAccordionChild}
                        elements={anomalyElements}
                        parentId={parentId}
                        sectionId={sectionId}
                    />
                </>
            )}

            {(!data.anomalies || data.anomalies.length < 1) && (
                <Alert
                    message={formatMessage({defaultMessage: 'There are no anomalies attached to this incident.'})}
                    type='info'
                    style={{marginTop: '8px'}}
                />
            )}

            {isRhs &&
                <HorizontalContainer>
                    <a
                        style={{marginTop: '24px'}}
                        href={`${channelUrl}#${id}`}
                        rel='noreferrer'
                    >
                        {`${formatMessage({defaultMessage: 'Go to Top'})}`}
                    </a>
                </HorizontalContainer>
            }
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export const HorizontalContainer = styled.div<{disable?: boolean}>`
    display: flex;
    flex-direction: ${({disable}) => (disable ? 'column' : 'row')};
    justify-content: 'space-between';
`;

const NoIncidentContainer = styled.div`
    padding: 10px;
    overflow-y: auto;
`;

export default Incident;