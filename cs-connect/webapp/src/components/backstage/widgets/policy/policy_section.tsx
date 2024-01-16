import React, {FC} from 'react';
import {Post} from 'mattermost-webapp/packages/types/src/posts';
import {Team} from 'mattermost-webapp/packages/types/src/teams';
import {useIntl} from 'react-intl';
import {IDMappedObjects} from 'mattermost-webapp/packages/types/src/utilities';

import {navigateToUrl} from 'src/browser_routing';
import {MultiText} from 'src/components/backstage/widgets/text_box/multi_text_box';

type JumpProps = {
    post: Post,
    team: Team,
};

const navigateToPost = async (teamName: string, postId: string) => {
    navigateToUrl(`/${teamName}/pl/${postId}`);
};

export const PolicyJump: FC<JumpProps> = ({
    post,
    team,
}) => {
    const {formatMessage} = useIntl();

    return (
        <div onClick={() => navigateToPost(team.name, post.id)}>
            {formatMessage({defaultMessage: 'Jump to Post'})}
        </div>
    );
};

type RemoveProps = {
    post: Post,
};

export const PolicyRemove: FC<RemoveProps> = ({
    post,
}) => {
    const {formatMessage} = useIntl();

    return (
        <div onClick={() => console.log('remove post ID', post.id, post.message)}>
            {formatMessage({defaultMessage: 'Remove'})}
        </div>
    );
};

export const generatePolicySectionMessages = (
    section: string[],
    allPosts: IDMappedObjects<Post>,
    team: Team,
    tooltipText: string,
): MultiText[] => {
    const pointer = true;

    const messages: MultiText[] = section ? section.
        map((s) => {
            const post = allPosts[s];
            return post ? {
                text: post.message,
                id: post.id,
                pointer,
                tooltipText,
                dropdownItems: [
                    {
                        label: (
                            <PolicyJump
                                post={post}
                                team={team}
                            />
                        ),
                        key: `${post.id}-jump`,
                    },
                    {
                        label: (
                            <PolicyRemove
                                post={post}
                            />
                        ),
                        danger: true,
                        key: `${post.id}-remove`,
                    },
                ],
            } : {text: ''};
        }).
        filter((message) => message.text !== '') : [];
    return messages;
};

