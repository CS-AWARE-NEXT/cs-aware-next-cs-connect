export interface UserAddedParams {
    teamId: string;
    userId: string;
}

export interface SetUserOrganizationParams {
    teamId: string;
    userId: string;
    orgId: string;
}

export interface GetUserPropsParams {
    userId: string;
}
