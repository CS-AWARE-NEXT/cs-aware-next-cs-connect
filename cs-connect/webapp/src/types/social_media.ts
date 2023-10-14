export type PostData = {
    items: Post[];
};

export type Post = {
    id: string;
    title: string;
    content: string;
    media?: string;
    avatar?: string;
    date?: string;
    url?: string;
    target?: string;
    likes: number;
    replies: number;
    retweets: number;
};