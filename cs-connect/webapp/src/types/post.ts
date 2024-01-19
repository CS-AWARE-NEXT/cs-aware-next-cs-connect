export type Post = {
    id: string;
    message: string;
};

export type PostsByIdsParams = {
    postIds: string[];
};

export type GetPostsByIdsResult = {
    posts: Post[];
};
