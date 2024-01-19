import {GlobalState} from 'mattermost-webapp/packages/types/src/store';
import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {
    PostWithFormatData,
    getAllPosts,
    getPost,
    getPostsInCurrentChannel,
} from 'mattermost-redux/selectors/entities/posts';
import {Team} from 'mattermost-webapp/packages/types/src/teams';
import {Channel} from 'mattermost-webapp/packages/types/src/channels';
import {Post} from 'mattermost-webapp/packages/types/src/posts';
import {IDMappedObjects} from 'mattermost-webapp/packages/types/src/utilities';

export const teamNameSelector = (teamId: string) => (state: GlobalState): Team => getTeam(state, teamId);
export const channelNameSelector = (channelId: string) => (state: GlobalState): Channel => getChannel(state, channelId);
export const postSelector = (postId: string) => (state: GlobalState): Post => getPost(state, postId);
export const postsInCurrentChannelSelector = () => (state: GlobalState): PostWithFormatData[] | undefined | null => getPostsInCurrentChannel(state);

// IDMappedObjects is a map of objects by id, e.g. postid: post
export const allPostsSelector = () => (state: GlobalState): IDMappedObjects<Post> => getAllPosts(state);