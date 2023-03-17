import React, {useContext} from 'react';
import styled from 'styled-components';
import {useRouteMatch} from 'react-router-dom';

import CopyLink from 'src/components/commons/copy_link';
import {buildTo, buildToForCopy} from 'src/hooks';
import {FullUrlContext} from 'src/components/rhs/rhs';

export enum CopyPosition {
    Right = 'right',
    Left = 'left',
}

type Props = {
    itemId: string;
    item: any;
    isLabel?: boolean;
    query: string;
    copyPosition?: CopyPosition;
    style?: CopyLinkTimelineItemStyle;
};

type CopyLinkTimelineItemStyle = {
    display?: string;
    iconMarginLeft?: string;
    iconMarginRight?: string;
};

export const CopyLinkTimelineItem = ({
    itemId,
    item,
    isLabel = false,
    query,
    copyPosition = CopyPosition.Right,
    style,
}: Props) => {
    const fullUrl = useContext(FullUrlContext);
    const {url} = useRouteMatch();

    const {label, text} = item;
    const to = buildToForCopy(buildTo(fullUrl, itemId, query, url));

    return (
        <TimelineItem
            id={itemId}
            key={itemId}
            display={style?.display}
            iconMarginLeft={style?.iconMarginLeft}
            iconMarginRight={style?.iconMarginRight}
        >
            {copyPosition === CopyPosition.Left &&
                <CopyLink
                    id={itemId}
                    text={text}
                    to={to}
                    name={text}
                    area-hidden={true}
                    iconWidth={'1.45em'}
                    iconHeight={'1.45em'}
                />}

            <TimelineText>{isLabel ? label : text}</TimelineText>

            {copyPosition === CopyPosition.Right &&
                <CopyLink
                    id={itemId}
                    text={text}
                    to={to}
                    name={text}
                    area-hidden={true}
                    iconWidth={'1.45em'}
                    iconHeight={'1.45em'}
                />}
        </TimelineItem>
    );
};

const TimelineItem = styled.span<{
    alignItems?: string;
    display?: string;
    iconMarginLeft?: string,
    iconMarginRight?: string,
    pointer?: boolean,
    isUrlHashed?: boolean,
}>`
    display: ${(props) => (props.display ? props.display : 'flex')};;
    align-items: ${(props) => (props.alignItems ? props.alignItems : 'center')};
    background: ${(props) => (props.isUrlHashed ? 'rgba(var(--center-channel-color-rgb), 0.08)' : 'var(--center-channel-bg)')};
    cursor: ${(props) => (props.pointer ? 'pointer' : 'auto')};
    ${CopyLink} {
        margin-left: ${(props) => (props.iconMarginLeft ? props.iconMarginLeft : '8px')};
        margin-right: ${(props) => (props.iconMarginRight ? props.iconMarginRight : '8px')};
        opacity: 1;
        transition: opacity ease 0.15s;
    }
    &:not(:hover) ${CopyLink}:not(:hover) {
        opacity: 0;
    }
`;

const TimelineText = styled.span`
    font-weight: 600;
    font-size: 14px;
    line-height: 12px;
`;