import React, {FC, useContext} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {Tag} from 'antd';
import moment from 'moment';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {HyperlinkPathContext} from 'src/components/rhs/rhs_shared';
import {buildQuery} from 'src/hooks';
import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {Anomaly as AnomalyType} from 'src/types/incident';
import {formatStringNoNewLine} from 'src/helpers';

import {HorizontalContainer} from './incident';

const DESCRIPTION_ID_PREFIX = 'anomaly-';

type Props = {
    data: AnomalyType;
    name?: string;
    parentId: string;
    sectionId: string;
};

const Anomaly: FC<Props> = ({data, name: widgetName, sectionId, parentId}) => {
    const {formatMessage} = useIntl();

    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const hyperlinkPathContext = useContext(HyperlinkPathContext);

    // widgetName will always be the name of the anomaly
    const name = widgetName ?? 'Anomaly';
    const hyperlinkPath = `${hyperlinkPathContext}.${name}`;

    const id = `${data.id}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    // TODO: removed because it is an ID
    const criticalAsset = data.attributes.critical_asset.asset_identifier || 'Unknown';
    const description = data.description || 'Description is not available yet';
    const srcIp = data.attributes.anomaly_details.src_ip || 'Unknown';
    const destIp = data.attributes.anomaly_details.dest_ip || 'Unknown';
    const protocol = data.attributes.anomaly_details.protocol || 'Unknown';
    const type = data.type || 'Unknown';
    const lineNumber = `${data.attributes.anomaly_details.line_number}` || 'Unknown';
    const filePath = data.attributes.anomaly_details.file_path || 'Unknown';

    // TODO: there are a few issues with some raw lines that make the accordion's dropdown strech too much
    const rawLine = data.attributes.anomaly_details.raw_line ?
        formatStringNoNewLine(data.attributes.anomaly_details.raw_line) :
        'Unknown';

    const prefix = `${DESCRIPTION_ID_PREFIX}${data.id}-`;

    return (
        <Container margin={widgetName !== undefined}>
            <HyperlinkPathContext.Provider value={hyperlinkPath}>
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
                        color='gold'
                        style={{marginRight: '8px'}}
                    >
                        {'Anomaly'}
                    </Tag>
                    <Tag
                        color='#3b5999'
                        style={{marginRight: '8px'}}
                    >
                        {type}
                    </Tag>
                </HorizontalContainer>

                {data.attributes.anomaly_details.detection_time &&
                    <TextBox
                        idPrefix={prefix}
                        name={formatMessage({defaultMessage: 'Detected'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`${moment(data.attributes.anomaly_details.detection_time).format('MMMM Do YYYY, h:mm:ss a')}`}
                        style={{marginTop: '24px', marginRight: '8px'}}
                        opaqueText={true}
                    />
                }

                <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'Type'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={type}
                    opaqueText={true}
                />

                <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'Description'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={description}
                    opaqueText={true}
                />

                {/* <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'Critical Asset'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={criticalAsset}
                    opaqueText={true}
                /> */}

                <HorizontalContainer>
                    <TextBox
                        idPrefix={prefix}
                        name={formatMessage({defaultMessage: 'Source IP'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={srcIp}
                        style={{marginTop: '24px', marginRight: '8px'}}
                        opaqueText={true}
                    />
                    <TextBox
                        idPrefix={prefix}
                        name={formatMessage({defaultMessage: 'Destination IP'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={destIp}
                        style={{marginTop: '24px', marginRight: '8px'}}
                        opaqueText={true}
                    />
                    <TextBox
                        idPrefix={prefix}
                        name={formatMessage({defaultMessage: 'Protocol'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={protocol}
                        opaqueText={true}
                    />
                </HorizontalContainer>

                <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'File Path'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={filePath}
                    opaqueText={true}
                />

                <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'Line Number'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={lineNumber}
                    opaqueText={true}
                />

                <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'Raw Line'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={rawLine}
                    opaqueText={true}
                />
            </HyperlinkPathContext.Provider>
        </Container>
    );
};

const Container = styled.div<{margin?: boolean}>`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: ${({margin}) => (margin ? '24px' : '0')};
`;

export default Anomaly;