export type UserRule = {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
};

export type UserRulesResult = {
    users: UserRule[];
};