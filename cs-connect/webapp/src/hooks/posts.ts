import {CommandArgs} from 'mattermost-webapp/packages/types/src/integrations';
import {Post} from 'mattermost-webapp/packages/types/src/posts';

import {hyperlinkPost, isMessageToHyperlink} from 'src/helpers';

export const slashCommandWillBePosted = async (message: string, args: CommandArgs) => {
    return {message, args};
};

export const messageWillBePosted = async (post: Post) => {
    if (!isMessageToHyperlink(post)) {
        return {post};
    }
    const hyperlinkedPost = await hyperlinkPost(post);
    return {post: hyperlinkedPost};
};

export const messageWillBeUpdated = async (post: Post) => {
    return messageWillBePosted(post);
};
