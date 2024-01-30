export type Policy = {
    id: string;
    name: string;
    description: string;
};

export type PolicyTemplate = Policy & {
    purpose: string[];
    elements: string[];
    need: string[];
    rolesAndResponsibilities: string[];
    references: string[];
    tags: string[];
    exported: boolean | string;
    [key: string]: string[] | string | boolean;
};

export type PolicyTemplateField = {
    policyId: string;
    field: string;
    value: string;
};