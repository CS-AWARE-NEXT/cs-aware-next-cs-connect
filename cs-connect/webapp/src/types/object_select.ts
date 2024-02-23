export type SelectObject = {
    value: string;
    label: string;
};

// This will appear in the select as the first option,
// helping users get a hint of what to do with the select
export const defaultSelectObject = {
    value: 'Select your organization',
    label: 'Select your organization',
};