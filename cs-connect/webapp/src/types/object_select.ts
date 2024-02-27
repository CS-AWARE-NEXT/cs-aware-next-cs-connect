export type SelectObject = {
    value: string;
    label: string;
};

// Used in various places such as playbook selects and the organization selector
export const defaultSelectObject = {
    value: '',
    label: '',
};
