import React, {useContext, useMemo} from 'react';
import {Timeline} from 'antd';
import {useLocation} from 'react-router-dom';
import styled from 'styled-components';

import {
    buildIdForUrlHashReference,
    buildQuery,
    formatName,
    isReferencedByUrlHash,
} from 'src/hooks';
import {TimelineData, TimelineDataItem} from 'src/types/timeline';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';

import {CopyLinkTimelineItem, CopyPosition} from './timeline_item';

type Props = {
    data: TimelineData;
    name: string;
    parentId: string;
    sectionId: string;
};

const ItemsTimeline = ({
    data,
    name = 'default',
    parentId,
    sectionId,
}: Props) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const {hash: urlHash} = useLocation();
    const query = buildQuery(parentId, sectionId);
    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;

    const items = useMemo<TimelineDataItem[]>(() => (data?.items?.map((item) => {
        const itemId = buildIdForUrlHashReference('timeline-item', item.id);
        return {
            color: isReferencedByUrlHash(urlHash, itemId) ? 'green' : 'blue',
            label: (
                <CopyLinkTimelineItem
                    itemId={itemId}
                    item={item}
                    isLabel={true}
                    query={isEcosystemRhs ? '' : query}
                    copyPosition={CopyPosition.Left}
                    style={{display: 'inline-block', iconMarginLeft: '0px'}}
                />
            ),
            children: (
                <CopyLinkTimelineItem
                    itemId={itemId}
                    item={item}
                    query={isEcosystemRhs ? '' : query}
                    style={{iconMarginRight: '0px'}}
                />
            ),
        };
    })), [data.items, urlHash]);

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={isEcosystemRhs ? '' : query}
                    text={name}
                    title={name}
                />
            </Header>
            <Timeline
                mode='left'
                items={items}
            />
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default ItemsTimeline;