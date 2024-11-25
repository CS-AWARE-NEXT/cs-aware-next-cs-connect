import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import {Incident as IncidentType} from 'src/types/incident';
import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {formatName} from 'src/helpers';
import {buildQuery} from 'src/hooks';

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
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const isRhs = useContext(IsRhsContext);
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
                    query={isEcosystemRhs ? '' : ecosystemQuery}
                    text={name}
                    title={name}
                />
            </Header>
            <div>
                <h1>{data.title}</h1>
                <p>{data.description}</p>
            </div>
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