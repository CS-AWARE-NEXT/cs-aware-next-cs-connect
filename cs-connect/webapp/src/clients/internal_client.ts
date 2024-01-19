// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {ClientError} from '@mattermost/client';
import qs from 'qs';

import {
    AddChannelParams,
    AddChannelResult,
    ArchiveChannelsParams,
    FetchChannelByIDResult,
    FetchChannelsParams,
    FetchChannelsResult,
} from 'src/types/channels';

// import {PLATFORM_CONFIG_CACHE_NAME} from 'src/config/config';

import {PlatformConfig} from 'src/types/organization';
import {pluginId} from 'src/manifest';
import {
    ArchiveIssueChannelsParams,
    GetUserPropsParams,
    SetUserOrganizationParams,
    UserAddedParams,
} from 'src/types/events';
import {UserResult} from 'src/types/users';
import {GetPostsByIdsResult, PostsByIdsParams} from 'src/types/post';

// import {getCachedResponse, putCacheResponse} from './cache';

let siteURL = '';
let basePath = '';
let apiUrl = `${basePath}/plugins/${pluginId}/api/v0`;

export const setSiteUrl = (url?: string): void => {
    if (url) {
        basePath = new URL(url).pathname.replace(/\/+$/, '');
        siteURL = url;
    } else {
        basePath = '';
        siteURL = '';
    }
    apiUrl = `${basePath}/plugins/${pluginId}/api/v0`;
};

export const getSiteUrl = (): string => {
    return siteURL;
};

export const getApiUrl = (): string => {
    return apiUrl;
};

export const loadPlatformConfig = async (
    path: string,
    setConfig: (config: PlatformConfig) => void,
): Promise<void> => {
    const url = `${apiUrl}${path}`;

    // const cachedConfig = await getCachedResponse<PlatformConfig>(PLATFORM_CONFIG_CACHE_NAME, url);
    // if (cachedConfig) {
    //     setConfig(cachedConfig);
    //     return;
    // }

    const config = await doGet<PlatformConfig>(url);
    if (!config) {
        return;
    }

    // await putCacheResponse(PLATFORM_CONFIG_CACHE_NAME, url, config);
    setConfig(config);
};

export const fetchAllUsers = async (teamId: string): Promise<UserResult> => {
    let data = await doGet(`${apiUrl}/users?team_id=${teamId}`);
    if (!data) {
        data = {users: []} as UserResult;
    }
    return data as UserResult;
};

export const fetchChannels = async (params: FetchChannelsParams): Promise<FetchChannelsResult> => {
    const queryParams = qs.stringify(params, {addQueryPrefix: true, indices: false});
    let data = await doGet(`${apiUrl}/channels/${params.section_id}${queryParams}`);
    if (!data) {
        data = {items: []} as FetchChannelsResult;
    }
    return data as FetchChannelsResult;
};

export const fetchChannelById = async (channelId: string): Promise<FetchChannelByIDResult> => {
    let data = await doGet<FetchChannelByIDResult>(`${apiUrl}/channel/${channelId}`);
    if (!data) {
        data = {channel: {}} as FetchChannelByIDResult;
    }
    return data;
};

export const fetchPostsByIds = async (params: PostsByIdsParams): Promise<GetPostsByIdsResult> => {
    let data = await doPost<GetPostsByIdsResult>(
        `${apiUrl}/posts`,
        JSON.stringify(params),
    );
    if (!data) {
        data = {posts: {}} as GetPostsByIdsResult;
    }
    return data;
};

export const addChannel = async (params: AddChannelParams): Promise<AddChannelResult> => {
    let data = await doPost<AddChannelResult>(
        `${apiUrl}/channels/${params.sectionId}`,
        JSON.stringify(params),
    );
    if (!data) {
        data = {channelId: '', parentId: '', sectionId: ''} as AddChannelResult;
    }
    return data;
};

export const userAdded = async (params: UserAddedParams): Promise<void> => {
    await doPost(
        `${apiUrl}/events/user_added`,
        JSON.stringify(params),
    );
};

export const setUserOrganization = async (params: SetUserOrganizationParams): Promise<void> => {
    await doPost(
        `${apiUrl}/events/set_organization`,
        JSON.stringify(params),
    );
};

export const archiveIssueChannels = async (params: ArchiveIssueChannelsParams): Promise<void> => {
    await doPost(
        `${apiUrl}/events/archive_issue_channels`,
        JSON.stringify(params),
    );
};

export const archiveChannels = async (params: ArchiveChannelsParams): Promise<void> => {
    await doPost(
        `${apiUrl}/channels/${params.sectionId}/archive_channels`,
        JSON.stringify(params),
    );
};

export interface UserProps {
    orgId: string;
}

export const getUserProps = async (params: GetUserPropsParams): Promise<UserProps> => {
    const queryParams = qs.stringify(params, {addQueryPrefix: true, indices: false});
    let data = await doGet(`${apiUrl}/events/user_props${queryParams}`);
    if (!data) {
        data = {orgId: ''} as UserProps;
    }
    return data as UserProps;
};

const doGet = async <TData = any>(url: string): Promise<TData | undefined> => {
    const {data} = await doFetchWithResponse<TData>(url, {method: 'get'});
    return data;
};

const doPost = async <TData = any>(url: string, body = {}): Promise<TData | undefined> => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'POST',
        body,
    });
    return data;
};

const doDelete = async <TData = any>(url: string, body = {}): Promise<TData | undefined> => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'DELETE',
        body,
    });
    return data;
};

const doPut = async <TData = any>(url: string, body = {}): Promise<TData | undefined> => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'PUT',
        body,
    });
    return data;
};

const doPatch = async <TData = any>(url: string, body = {}): Promise<TData | undefined> => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'PATCH',
        body,
    });
    return data;
};

const doFetchWithResponse = async <TData = any>(
    url: string,
    options = {},
): Promise<{
    response: Response;
    data: TData | undefined;
}> => {
    const response = await fetch(url, Client4.getOptions(options));
    let data;
    if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType === 'application/json') {
            data = await response.json() as TData;
        }
        return {
            response,
            data,
        };
    }

    data = await response.text();

    throw new ClientError(Client4.url, {
        message: data || '',
        status_code: response.status,
        url,
    });
};

const doFetchWithTextResponse = async <TData extends string>(
    url: string,
    options = {},
): Promise<{
    response: Response;
    data: TData;
}> => {
    const response = await fetch(url, Client4.getOptions(options));
    let data;
    if (response.ok) {
        data = await response.text() as TData;
        return {
            response,
            data,
        };
    }

    data = await response.text();

    throw new ClientError(Client4.url, {
        message: data || '',
        status_code: response.status,
        url,
    });
};

const doFetchWithoutResponse = async (
    url: string,
    options = {},
): Promise<void> => {
    const response = await fetch(url, Client4.getOptions(options));
    if (response.ok) {
        return;
    }

    throw new ClientError(Client4.url, {
        message: '',
        status_code: response.status,
        url,
    });
};

