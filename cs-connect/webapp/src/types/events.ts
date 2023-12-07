export interface UserAddedParams {
    teamId: string;
    userId: string;
}

export interface SetUserOrganizationParams {
    teamId: string;
    userId: string;
    orgId: string;
    password?: string;
}

export interface GetUserPropsParams {
    userId: string;
}

export interface ArchiveIssueChannelsParams {
    issueId: string;
}
