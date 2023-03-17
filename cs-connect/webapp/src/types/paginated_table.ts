export interface PaginatedTableData {
    columns: PaginatedTableColumn[];
    rows: PaginatedTableRow[];
}

export interface PaginatedTableColumn {
    dataIndex: string;
    key: string;
    title: string;
    width?: string;
    render?: (text: string, record: PaginatedTableRow) => JSX.Element;
}

export type PaginatedTableRow = any;