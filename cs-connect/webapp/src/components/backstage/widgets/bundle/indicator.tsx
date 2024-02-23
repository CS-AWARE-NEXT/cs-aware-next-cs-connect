import React, {FC, useContext} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import moment from 'moment';
import {Tag} from 'antd';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {BundleObject} from 'src/types/bundles';
import {formatName} from 'src/helpers';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {HyperlinkPathContext} from 'src/components/rhs/rhs_shared';
import {buildQuery} from 'src/hooks';
import TextBox from 'src/components/backstage/widgets/text_box/text_box';

import {HorizontalContainer} from './bundle';

const DESCRIPTION_ID_PREFIX = 'indicator-';

type Props = {
    data: BundleObject;
    parentId: string;
    sectionId: string;
};

const Indicator: FC<Props> = ({data, sectionId, parentId}) => {
    const {formatMessage} = useIntl();

    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const hyperlinkPathContext = useContext(HyperlinkPathContext);

    const name = data.name || 'Indicator';
    const hyperlinkPath = `${hyperlinkPathContext}.${name}`;

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    return (
        <Container>
            <HyperlinkPathContext.Provider value={hyperlinkPath}>
                <Header>
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
                        {'indicator'}
                    </Tag>
                    {data.indicator_types && data.indicator_types.length > 0 && data.indicator_types.map((indicatorType, index) => (
                        <Tag
                            key={index}
                            color='red'
                            style={{marginRight: '8px'}}
                        >
                            {indicatorType}
                        </Tag>
                    ))}
                </HorizontalContainer>

                {data.description &&
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Description'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={data.description}
                    />
                }

                <HorizontalContainer>
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Created'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`${moment(data.created).format('MMMM Do YYYY, h:mm:ss a')}`}
                        style={{marginTop: '24px', marginRight: '8px'}}
                    />
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Modified'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`${moment(data.modified).format('MMMM Do YYYY, h:mm:ss a')}`}
                        style={{marginTop: '24px', marginRight: '8px'}}
                    />
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Valid From'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`${moment(data.valid_from).format('MMMM Do YYYY, h:mm:ss a')}`}
                    />
                </HorizontalContainer>

                <TextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Pattern'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={`${data.pattern}`}
                />
            </HyperlinkPathContext.Provider>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

export default Indicator;