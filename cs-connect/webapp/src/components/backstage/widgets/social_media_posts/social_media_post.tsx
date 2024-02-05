import React, {FC, useContext} from 'react';
import {useRouteMatch} from 'react-router-dom';
import {Avatar as AntdAvatar, List, Space} from 'antd';
import {
    LikeOutlined,
    MessageOutlined,
    NodeIndexOutlined,
    RetweetOutlined,
} from '@ant-design/icons';
import Avatar from 'react-avatar';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {MarkdownEditWithID} from 'src/components/commons/markdown_edit';
import {
    buildQuery,
    buildTo,
    buildToForCopy,
    isReferencedByUrlHash,
    useUrlHash,
} from 'src/hooks';
import {CopyImage} from 'src/components/commons/copy_link';
import {Post} from 'src/types/social_media';
import HrefTooltip from 'src/components/commons/href_tooltip';

import SocialMediaPostTitle from './social_media_post_title';

const Item = List.Item;
const Meta = Item.Meta;

type Props = {
    post: Post;
    parentId: string;
    sectionId: string;
    hyperlinkPath: string;
};

const getAvatarComponent = (
    avatar: string | undefined,
    hint: string,
    href: string | undefined,
    tooltipMessage: string | undefined,
): JSX.Element => {
    // Default antd size
    const size = 55;
    const avatarComponent = avatar ? (
        <AntdAvatar
            size={size}
            src={avatar}
        />
    ) : (
        <Avatar
            size={`${size}px`}
            name={hint}
            round={true}
        />
    );
    return (
        <HrefTooltip
            title={tooltipMessage ?? ''}
            href={href ?? ''}
        >
            {avatarComponent}
        </HrefTooltip>
    );
};

const SocialMediaPost: FC<Props> = ({post, parentId, sectionId, hyperlinkPath}) => {
    const {formatMessage} = useIntl();
    const isRhs = useContext(IsRhsContext);
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const {url} = useRouteMatch();
    const urlHash = useUrlHash();

    const postId = `smp-${post.id}-`;
    const mediaId = `${postId}media`;
    const query = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    const href = post.url ?? '';
    const viewOnTwitter = formatMessage({defaultMessage: 'View on Twitter'});

    const actions = [
        <HrefTooltip
            title={viewOnTwitter}
            href={href}
            key={`${postId}like`}
        >
            <IconText
                icon={LikeOutlined}
                text={`${post.likes}`}
            />
        </HrefTooltip>,
        <HrefTooltip
            title={viewOnTwitter}
            href={href}
            key={`${postId}message`}
        >
            <IconText
                icon={MessageOutlined}
                text={`${post.replies}`}
            />
        </HrefTooltip>,
        <HrefTooltip
            title={viewOnTwitter}
            href={href}
            key={`${postId}share`}
        >
            <IconText
                icon={RetweetOutlined}
                text={`${post.retweets}`}
            />
        </HrefTooltip>,
        <Target
            key={`${postId}target`}
            style={{color: 'black', fontSize: 'bold'}}
        >
            {post.target && <><NodeIndexOutlined/> {post.target}</>}
        </Target>,
    ];

    const getMediaComponent = (width: string | number): JSX.Element | null => {
        if (!post.media) {
            return null;
        }
        return (
            <CopyImage
                to={buildToForCopy(buildTo(fullUrl, mediaId, query, url))}
                text={`${hyperlinkPath}.${post.title}.Media`}
                imageProps={{
                    id: mediaId,
                    width,
                    alt: 'media',
                    src: post.media,
                    borderBox: isReferencedByUrlHash(urlHash, mediaId) ? '2px 2px 4px rgb(244, 180, 0), -2px -2px 4px rgb(244, 180, 0)' : '',
                }}
            />
        );
    };

    return (
        <Item
            id={postId}
            key={postId}
            actions={actions}
            extra={isRhs ? null : getMediaComponent(300)}
        >
            <Meta
                avatar={getAvatarComponent(post.avatar, post.title, href, viewOnTwitter)}
                description={post.date}
                title={
                    <SocialMediaPostTitle
                        id={postId}
                        title={post.title}
                        parentId={parentId}
                        sectionId={sectionId}
                        hyperlinkPath={hyperlinkPath}
                    />}
            />
            <MarkdownEditWithID
                id={`${postId}content`}
                textBoxProps={{
                    value: post.content,
                    placeholder: '',
                    noBorder: !isReferencedByUrlHash(urlHash, postId),
                    borderColor: isReferencedByUrlHash(urlHash, postId) ? 'rgb(244, 180, 0)' : undefined,
                }}
            />
            <br/>
            {isRhs ? getMediaComponent('100%') : null}
        </Item>
    );
};

const IconText = ({icon, text}: {icon: FC; text: string}) => (
    <Space>
        {React.createElement(icon)}
        {text}
    </Space>
);

const Target = styled.div``;

export default SocialMediaPost;
