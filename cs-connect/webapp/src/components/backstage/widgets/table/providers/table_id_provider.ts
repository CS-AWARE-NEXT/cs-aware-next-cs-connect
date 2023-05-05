import {fetchTableData} from 'src/clients';
import {formatName, formatUrlWithId} from 'src/hooks';
import {Widget} from 'src/types/organization';
import {HyperlinkReference, WidgetHash} from 'src/types/parser';
import {TableRowData} from 'src/types/table';

type RowPair = Pick<TableRowData, 'id'> & {text: string};

// TableReference example: #observed-data-2ce53d5c-4bd4-4f02-89cc-d5b8f551770c-3-widget
// RowReference example: #table-row-18621aed-cbff-44ab-a161-a14b6ad2845e
export const buildTableWidgetId = async (
    {section, object}: HyperlinkReference,
    tokens: string[],
    {name, url}: Widget,
): Promise<WidgetHash> => {
    const tableWidgetHash = {
        hash: `${formatName(name as string)}-${object.id}-${section?.id}-widget`,
        text: name as string,
    };
    const isReferenceToTable = tokens.length < 1;
    if (isReferenceToTable) {
        return tableWidgetHash;
    }
    const rowPair = await buildRowPair(tokens, formatUrlWithId(url as string, object.id));
    return rowPair ? {
        hash: rowPair.id,
        text: rowPair.text,
    } : tableWidgetHash;
};

const buildRowPair = async (tokens: string[], url: string): Promise<RowPair | null> => {
    const notEnoughTokensForRowReference = tokens.length < 2;
    if (notEnoughTokensForRowReference) {
        return null;
    }
    const headerName = tokens.splice(0, 1)[0];
    const rowValue = tokens.splice(0, 1)[0];
    const data = await fetchTableData(url);
    if (!data) {
        return null;
    }
    const {headers, rows} = data;
    const index = headers.findIndex(({name}) => name === headerName);
    if (index === -1) {
        return null;
    }
    const rowId = findRowId(rows, index, rowValue);
    if (rowId === '') {
        return null;
    }
    return {
        id: `table-row-${rowId}`,
        text: rowValue,
    };
};

const findRowId = (rows: TableRowData[], index: number, value: string): string => {
    // Finds the row where the value at the same index of the requested column
    // is equal to the value provided
    const row = rows.find(({values}) => values[index].value === value);
    if (!row) {
        return '';
    }
    return row.id;
};