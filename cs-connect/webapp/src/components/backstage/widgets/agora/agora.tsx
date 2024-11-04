import React, {useContext} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {Alert} from 'antd';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {formatName} from 'src/helpers';

type Props = {
    data: any;
    name: string;
    url?: string;
    parentId: string;
    sectionId: string;
};

const Agora = ({
    data,
    name = '',
    url = '',
    parentId,
    sectionId,
}: Props) => {
    console.log('parentId', parentId, 'sectionId', sectionId);
    const {formatMessage} = useIntl();
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={ecosystemQuery}
                    text={name}
                    title={name}
                />
            </Header>
            <>
                <Alert
                    message='Coming soon!'
                    description='The Agora tab will be ready soon, please wait for it!.'
                    type='info'
                    showIcon={true}
                />
            </>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default Agora;
