import {Post as MattermostPost} from 'mattermost-webapp/packages/types/src/posts';

export type Post = {
    id: string;
    message: string;
};

// Maps a server-side Map with an object that has the map's keys as keys and map's values as values
export type IDMappedPosts = {
    [id: string]: MattermostPost;
}

export type PostsByIdsParams = {
    postIds: string[];
};

export type GetPostsByIdsResult = {
    posts: Post[];
};

export type PostsForTeamParams = {
    teamId: string;
};

export type GetPostsForTeamResult = {
    posts: IDMappedPosts;
};