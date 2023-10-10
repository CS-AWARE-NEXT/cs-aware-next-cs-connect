import React, {FC, useContext} from 'react';
import {useRouteMatch} from 'react-router-dom';
import {Avatar as AntdAvatar, List, Space} from 'antd';
import {LikeOutlined, MessageOutlined} from '@ant-design/icons';
import Avatar from 'react-avatar';

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

import SocialMediaPostTitle from './social_media_post_title';

const Item = List.Item;
const Meta = Item.Meta;

type Props = {
    post: Post;
    parentId: string;
    sectionId: string;
};

const getAvatarComponent = (avatar: string | undefined, hint: string): JSX.Element => {
    // Default antd size
    const size = 32;
    return avatar ?
        <AntdAvatar
            size={size}
            src={avatar}
        /> :
        <Avatar
            size={`${size}px`}
            name={hint}
            round={true}
        />;
};

const SocialMediaPost: FC<Props> = ({post, parentId, sectionId}) => {
    const isRhs = useContext(IsRhsContext);
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const {url} = useRouteMatch();
    const urlHash = useUrlHash();

    const postId = `smp-${post.id}-`;
    const mediaId = `${postId}media`;
    const query = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    const actions = [
        <IconText
            icon={LikeOutlined}
            text='150'
            key={`${postId}like`}
        />,
        <IconText
            icon={MessageOutlined}
            text='10'
            key={`${postId}message`}
        />,
    ];

    const getMediaComponent = (width: string | number): JSX.Element | null => {
        if (!post.media) {
            return null;
        }
        return (
            <CopyImage
                to={buildToForCopy(buildTo(fullUrl, mediaId, query, url))}
                text={`${post.title}'s media`}
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
                avatar={getAvatarComponent(post.avatar, post.title)}
                title={
                    <SocialMediaPostTitle
                        id={postId}
                        title={post.title}
                        parentId={parentId}
                        sectionId={sectionId}
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

export default SocialMediaPost;
