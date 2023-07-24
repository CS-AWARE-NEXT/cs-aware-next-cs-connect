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