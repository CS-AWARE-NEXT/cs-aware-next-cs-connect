export type Outcome = {
    id?: string;
    outcome: string;
}

export type Role = {
    id?: string;
    userId: string;
    roles: string[];
};

export type StepRole = Pick<Role, 'userId' | 'roles'>;

export type Attachment = {
    id?: string;
    attachment: string;
};