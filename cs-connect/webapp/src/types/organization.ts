export interface PlatformConfig {
    environmentConfig: EnvironmentConfig;
    organizations: Organization[];
}

export interface EnvironmentConfig {
    showOptionsConfig?: ShowOptionsConfig;
}

export interface ShowOptionsConfig {
    showAddChannelButton?: boolean;
    showUnreadIndicator?: boolean;
    showDirectMessages?: boolean;
    showDefaultChannels?: boolean;
}

export interface Organization {
    isEcosystem?: boolean;
    description?: string;
    id: string;
    name: string;
    sections: Section[];
    widgets: Widget[];
}

export interface Section {
    id: string;
    internal: boolean;
    name: string;
    url: string;
    sections: Section[];
    widgets: Widget[];
}

export interface Widget {
    name?: string;
    type: string;
    url?: string;
}

export interface SectionInfo {
    id: string;
    name: string;
    [key: string]: any;
}

export interface SectionInfoParams {
    name: string;
    [key: string]: any;
}

export interface FetchOrganizationsParams {
    direction?: string;
    page: number;
    per_page: number;
    organization_id?: string;
    search_term?: string;
    sort?: string;
    team_id?: string;
}

export type Object = any;
