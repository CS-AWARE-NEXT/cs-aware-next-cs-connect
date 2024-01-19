import React, {Dispatch, FC, SetStateAction} from 'react';
import {Post} from 'mattermost-webapp/packages/types/src/posts';
import {Team} from 'mattermost-webapp/packages/types/src/teams';
import {useIntl} from 'react-intl';
import {IDMappedObjects} from 'mattermost-webapp/packages/types/src/utilities';

import {navigateToUrl} from 'src/browser_routing';
import {MultiText} from 'src/components/backstage/widgets/text_box/multi_text_box';
import {PolicyTemplate} from 'src/types/policy';

import {saveSectionInfo} from 'src/clients';

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
        section = section.filter((id) => id !== post.id);
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
    allPosts: IDMappedObjects<Post>,
    team: Team,
    tooltipText: string,

    removeEndpoint: string,
};

export const generatePolicySectionMessages = (options: PolicySectionOptions): MultiText[] => {
    const {
        template,
        setTemplate,
        sectionName,
        allPosts,
        team,
        tooltipText,
        removeEndpoint,
    } = options;

    const pointer = true;

    const messages: MultiText[] = template && template[sectionName] ? template[sectionName].
        map((section) => {
            const post = allPosts[section];
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
            } : {text: ''};
        }).
        filter((message) => message.text !== '') : [];
    return messages;
};

