import React, {FC, useContext} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import moment from 'moment';
import {Tag} from 'antd';

import {Anomaly as AnomalyType, Incident as IncidentType} from 'src/types/incident';
import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {formatName} from 'src/helpers';
import {buildQuery, getUrlWithoutQueryParamsAndFragment, useOrganization} from 'src/hooks';
import {HorizontalSeparator, VerticalSpacer} from 'src/components/backstage/grid';
import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import GraphWrapper from 'src/components/backstage/widgets/graph/wrappers/graph_wrapper';
import Accordion from 'src/components/backstage/widgets/accordion/accordion';

import AnomalyAccordionChild from './anomaly_accordion_child';

const DESCRIPTION_ID_PREFIX = 'incident-details-';

type Props = {
    data: IncidentType;
    name: string;
    url?: string;
    parentId: string;
    sectionId: string;
};

const Incident: FC<Props> = ({
    data,
    name = '',
    url = '',
    parentId,
    sectionId,
}) => {
    const {formatMessage} = useIntl();

    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const isRhs = useContext(IsRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const organizationId = useContext(OrganizationIdContext);
    const organization = useOrganization(organizationId);
    const channelUrl = getUrlWithoutQueryParamsAndFragment();

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

    // to use anomalies as elements in the accordion
    // name is currently different than the header because the hyperlinks would be too long otherwise
    const anomalyElements = data.anomalies.map((anomaly: AnomalyType) => ({
        anomaly,
        header: `Anomaly at line ${anomaly.attributes.anomaly_details.line_number} of ${anomaly.attributes.anomaly_details.file_path}`,
        name: `Anomaly at line ${anomaly.attributes.anomaly_details.line_number}`,
        id: `${anomaly.id}`,
    })) ?? [];

    // the incident container expects the url to be /details
    // and then converts it to be the graph url /graph
    const graphUrl = url.replace('details', 'graph');

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

            <HorizontalContainer>
                <a
                    style={{marginTop: '24px'}}
                    href={`${channelUrl}#${anomaliesAccordionId}`}
                    rel='noreferrer'
                >
                    {`${formatMessage({defaultMessage: 'Go to Anomalies'})}`}
                </a>
            </HorizontalContainer>

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

            <HorizontalContainer>
                <a
                    style={{marginTop: '24px'}}
                    href={`${channelUrl}#${id}`}
                    rel='noreferrer'
                >
                    {`${formatMessage({defaultMessage: 'Go to Top'})}`}
                </a>
            </HorizontalContainer>
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

export default Incident;