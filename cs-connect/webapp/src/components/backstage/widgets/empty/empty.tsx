import React, {FC} from 'react';
import styled from 'styled-components';
import {Empty as AntdEmpty} from 'antd';

// import {FullUrlContext} from 'src/components/rhs/rhs';
// import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {Header, LinkTitle} from 'src/components/backstage/widgets/shared';
import {formatName} from 'src/helpers';

type Props = {
    name: string;
    parentId: string;
    sectionId?: string;
};

// TODO: solve the problem related to the component preventing the rhs to render when AnchorLinkTitle is added
// More in detail, the problem is with the CopyIcon component.
const Empty: FC<Props> = ({name, parentId, sectionId}) => {
    // const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    // const fullUrl = useContext(FullUrlContext);
    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                {/* <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={isEcosystemRhs ? '' : buildQuery(parentId, sectionId)}
                    text={name}
                    title={name}
                /> */}
                <LinkTitle
                    id={id}
                >
                    {name}
                </LinkTitle>
            </Header>
            <AntdEmpty/>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default Empty;