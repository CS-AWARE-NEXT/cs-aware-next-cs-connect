import {CommandArgs} from 'mattermost-webapp/packages/types/src/integrations';
import {Post} from 'mattermost-webapp/packages/types/src/posts';

export const slashCommandWillBePosted = async (message: string, args: CommandArgs) => {
    return {message, args};
};

export const messageWillBePosted = async (post: Post) => {
    return {post};
};
