export interface WidgetChannel {
    channelId: string;
    parentId: string;
    sectionId: string;
}

export interface FetchChannelsParams {
    parent_id: string;
    section_id: string;
}

export interface FetchChannelsResult {
    items: WidgetChannel[];
}

export interface FetchChannelByIDResult {
    channel: WidgetChannel;
}

export interface ChannelCreation {
    channelId: string;
    channelMode: string;
    channelName: string;
    createPublicChannel: boolean;
    teamId: string;
}

export interface AddChannelParams {
    channelId?: string;
    channelName?: string;
    createPublicChannel?: boolean;
    sectionId: string;
    parentId: string;
    teamId: string;
    organizationId: string;
}

export interface AddChannelResult {
    channelId: string;
    parentId: string,
    sectionId: string;
}

export const notFoundWidgetChannel: WidgetChannel = {
    channelId: 'not-found',
    parentId: '',
    sectionId: '',
};
