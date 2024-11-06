import React, {Dispatch, FC, SetStateAction} from 'react';
import {Post} from 'mattermost-webapp/packages/types/src/posts';
import {Team} from 'mattermost-webapp/packages/types/src/teams';
import {useIntl} from 'react-intl';

import {navigateToUrl} from 'src/browser_routing';
import {MultiText} from 'src/components/backstage/widgets/text_box/multi_text_box';
import {PolicyTemplate} from 'src/types/policy';
import {saveSectionInfo} from 'src/clients';
import {IDMappedPosts} from 'src/types/post';

type JumpProps = {
    post: Post;
    team: Team;
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
            {formatMessage({defaultMessage: 'Jump to message'})}
        </div>
    );
};

type RemoveProps = {
    template: PolicyTemplate;
    setTemplate: Dispatch<SetStateAction<PolicyTemplate>>;
    sectionName: string;
    post: Post;
    removeEndpoint: string;
};

export const PolicyRemove: FC<RemoveProps> = ({
    template,
    setTemplate,
    sectionName,
    post,
    removeEndpoint,
}) => {
    const {formatMessage} = useIntl();

    const remove = async () => {
        let section = template[sectionName];
        section = (section as string[]).filter((id) => id !== post.id);
        template[sectionName] = section;
        await saveSectionInfo(template, removeEndpoint);
        setTemplate({...template});
    };

    return (
        <div onClick={() => remove()}>
            {formatMessage({defaultMessage: 'Remove'})}
        </div>
    );
};

type PolicySectionOptions = {
    template: PolicyTemplate,
    setTemplate: Dispatch<SetStateAction<PolicyTemplate>>;
    sectionName: string,
    allPosts?: IDMappedPosts,
    team: Team,
    tooltipText: string,
    isRhs: boolean,

    removeEndpoint: string,
};

export const generatePolicySectionMessages = (options: PolicySectionOptions): MultiText[] => {
    const {
        template,
        setTemplate,
        sectionName,
        allPosts,
        team,
        isRhs,
        tooltipText,
        removeEndpoint,
    } = options;

    const pointer = true;

    if (!allPosts) {
        return [];
    }

    const messages: MultiText[] = template && template[sectionName] ? (template[sectionName] as string[]).
        map((section) => {
            const post = allPosts[section];
            if (!post) {
                return {text: ''};
            }

            const message = {
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
                                template={template}
                                setTemplate={setTemplate}
                                sectionName={sectionName}
                                post={post}
                                removeEndpoint={removeEndpoint}
                            />
                        ),
                        danger: true,
                        key: `${post.id}-remove`,
                    },
                ],
            };

            if (!isRhs) {
                // do not allow remove when in backstage
                message.dropdownItems = message.dropdownItems.filter((item) => item.key !== `${post.id}-remove`);
            }

            return message;

            // In case you want to allow removing posts from the policy only for the user who created the post
            // const isPostFromCurrentUser = post.user_id === userId;
            // if (isPostFromCurrentUser) {
            //     if (message.dropdownItems) {
            //         message.dropdownItems.push({
            //             label: (
            //                 <PolicyRemove
            //                     template={template}
            //                     setTemplate={setTemplate}
            //                     sectionName={sectionName}
            //                     post={post}
            //                     removeEndpoint={removeEndpoint}
            //                 />
            //             ),
            //             danger: true,
            //             key: `${post.id}-remove`,
            //         });
            //     }
            // }
        }).
        filter((message) => message.text !== '') : [];
    return messages;
};

export const getTimeOfFirstPost = (allPosts: IDMappedPosts): number => {
    let time = 0;
    if (!allPosts) {
        return time;
    }

    for (const post of Object.values(allPosts)) {
        if (post.create_at < time || time === 0) {
            time = post.create_at;
        }
    }
    return time;
};