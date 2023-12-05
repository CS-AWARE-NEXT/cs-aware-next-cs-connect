export interface PaginatedTableData {
    columns: PaginatedTableColumn[];
    rows: PaginatedTableRow[];
}

export interface PaginatedTableColumn {
    dataIndex: string;
    key: string;
    title: string;
    width?: string;
    sortable?: boolean;
    render?: (text: string, record: PaginatedTableRow) => JSX.Element;
    sorter?: (a: PaginatedTableRow, b: PaginatedTableRow) => number;
}

export type PaginatedTableRow = any;

export const NO_SORTER = false;
export const WITH_SORTER = true;