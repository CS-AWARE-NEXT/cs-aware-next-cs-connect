import React, {FC, useContext} from 'react';
import {useRouteMatch} from 'react-router-dom';
import styled from 'styled-components';

import {FullUrlContext} from 'src/components/rhs/rhs';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {buildQuery, buildTo, buildToForCopy} from 'src/hooks';
import CopyLink, {StyledCopyText} from 'src/components/commons/copy_link';

import {PostOptions} from './social_media_post';

type Props = {
    id: string;
    title: string;
    parentId: string;
    sectionId: string;
    hyperlinkPath: string;
    postOptions?: PostOptions;
    textToCopy?: string;
};

const SocialMediaPostTitle: FC<Props> = ({
    id,
    title,
    parentId,
    sectionId,
    hyperlinkPath,
    postOptions,
    textToCopy = '',
}) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const {url} = useRouteMatch();
    const query = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);
    const shouldAllowCopy = !postOptions || !postOptions.noHyperlinking;

    return (
        <Title>
            <TitleText>{title}</TitleText>
            {shouldAllowCopy ?
                <CopyLink
                    id={id}
                    text={`${hyperlinkPath}.${title}`}
                    to={buildToForCopy(buildTo(fullUrl, id, query, url))}
                    name={title}
                    area-hidden={true}
                    iconWidth={'1.45em'}
                    iconHeight={'1.45em'}
                /> :
                <StyledCopyText
                    id={id}
                    text={textToCopy}
                    to=''
                    name={title}
                    area-hidden={true}
                    iconWidth={'1.45em'}
                    iconHeight={'1.45em'}
                />
            }
        </Title>
    );
};

const Title = styled.div<{
    iconMarginLeft?: string,
    iconMarginRight?: string,
}>`
    ${CopyLink} {
        margin-left: ${(props) => (props.iconMarginLeft ? props.iconMarginLeft : '8px')};
        margin-right: ${(props) => (props.iconMarginRight ? props.iconMarginRight : '8px')};
        opacity: 1;
        transition: opacity ease 0.15s;
    }
    &:not(:hover) ${CopyLink}:not(:hover) {
        opacity: 0;
    }

    ${StyledCopyText} {
        margin-left: ${(props) => (props.iconMarginLeft ? props.iconMarginLeft : '8px')};
        margin-right: ${(props) => (props.iconMarginRight ? props.iconMarginRight : '8px')};
        opacity: 1;
        transition: opacity ease 0.15s;
    }
    &:not(:hover) ${StyledCopyText}:not(:hover) {
        opacity: 0;
    }
`;

const TitleText = styled.span`
    font-weight: 600;
    font-size: 14px;
    line-height: 12px;
`;

export default SocialMediaPostTitle;
