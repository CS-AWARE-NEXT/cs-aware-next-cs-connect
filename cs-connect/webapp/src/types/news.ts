import {PostData} from './social_media';

export type NewsPostData = PostData;

export type NewsError = RequestError;

export type NewsQuery = {
    search: string;
    offset: string;
    limit: string;
};