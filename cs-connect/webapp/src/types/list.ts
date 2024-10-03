export interface ListData {
    items: ListItem[];
}

export interface ListItem {
    id: string;
    text: string;
}

export const fromStrings = (strings: string[] | undefined): ListData => {
    if (!strings || strings.length < 1) {
        return {items: []};
    }
    const items = [...new Set(strings)].map((s) => ({id: s, text: s}));
    return {items};
};

export interface LinkListData {
    items: LinkListItem[];
}

export interface LinkListItem {
    id?: string;
    name: string;
    description: string;
    to: string;
    organizationId: string;
    parentId: string;
}