export type UserResult = {
    users: User[];
};

export type User = {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
};

export type UserOption = {
    label: string;
    value: string;
};