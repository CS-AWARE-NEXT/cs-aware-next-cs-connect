import React, {FC, useContext} from 'react';
import styled, {css} from 'styled-components';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {formatName} from 'src/helpers';
import {BundleData, BundleObjectType} from 'src/types/bundles';

import Indicator from './indicator';
import Malware from './malware';

type Props = {
    data: BundleData;
    name: string;
    parentId: string;
    sectionId: string;
};

const Bundle: FC<Props> = ({
    data,
    name = '',
    parentId,
    sectionId,
}) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    const relationship = data?.objects?.find((obj) => obj.type === BundleObjectType.Relationship);
    if (!relationship) {
        return null;
    }

    // TODO: source and target components should be chosen based on the type of the object
    // (e.g. malware -> Malware, indicator -> Indicator, etc.)
    const source = data.objects.find((obj) => obj.id === relationship.source_ref);
    const target = data.objects.find((obj) => obj.id === relationship.target_ref);
    if (!source || !target) {
        return null;
    }

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

            <BorderBox border={true}>
                <Indicator
                    data={source}
                    parentId={parentId}
                    sectionId={sectionId}
                />
            </BorderBox>

            <RelationshipTitle>{relationship.relationship_type}</RelationshipTitle>

            <BorderBox border={true}>
                <Malware
                    data={target}
                    parentId={parentId}
                    sectionId={sectionId}
                />
            </BorderBox>
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

const BorderBox = styled.div<{border?: boolean}>`
    padding: 8px;
    border-radius: 8px;

    ${({border}) => border && css`
        border: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
    `}
`;

export const RelationshipTitle = styled.h3`
    font-family: Metropolis, sans-serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    padding-left: 8px;
    margin: 0;
    margin-top: 8px;
    margin-bottom: 8px;
    white-space: nowrap;
    display: inline-block;
    /* text-wrap: wrap; */
`;

export default Bundle;