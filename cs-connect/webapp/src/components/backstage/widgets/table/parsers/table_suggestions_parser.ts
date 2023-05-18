import {fetchTableData} from 'src/clients';
import {TOKEN_SEPARATOR} from 'src/constants';
import {formatUrlWithId, getAndRemoveOneFromArray} from 'src/helpers';
import {Widget} from 'src/types/organization';
import {HyperlinkSuggestion, SuggestionsData} from 'src/types/parser';
import {RowPair, TableData, TableRowData} from 'src/types/table';

const emptySuggestions = {suggestions: []};

export const parseTableWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    reference: string,
    widget: Widget,
): Promise<SuggestionsData> => {
    const headerOrRowName = parseHeaderOrRowName(reference);
    const data = await getTableData(hyperlinkSuggestion, widget);
    if (!data) {
        return emptySuggestions;
    }
    const {headers, rows} = data;
    const isHeaderNameGiven = headers.some(({name}) => name === headerOrRowName);
    if (isHeaderNameGiven) {
        const suggestions = await parseRowSuggestions(headerOrRowName, data);
        return suggestions;
    }
    const isRowNameGiven = rows.some(({name}) => name === headerOrRowName);
    if (isRowNameGiven) {
        return emptySuggestions;
    }
    const suggestions = await parseHeaderSuggestions(data);
    return suggestions;
};

const parseHeaderSuggestions = async (data: TableData): Promise<SuggestionsData> => {
    const suggestions = data.headers.
        map(({name}) => ({
            id: name,
            text: name,
        }));
    return {suggestions};
};

const parseRowSuggestions = async (
    headerName: string,
    data: TableData,
): Promise<SuggestionsData> => {
    const {headers, rows} = data;
    const index = headers.findIndex(({name}) => name === headerName);
    if (index === -1) {
        return emptySuggestions;
    }
    const suggestions = rows.map(({id, values}) => ({
        id,
        text: values[index].value,
    }));
    return {suggestions};
};

const parseHeaderOrRowName = (reference: string): string => {
    const tokens = reference.
        split(TOKEN_SEPARATOR).
        filter((token) => token !== '');
    return tokens[tokens.length - 1];
};

export const parseTableWidgetSuggestionsWithHint = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
    widget: Widget,
): Promise<SuggestionsData> => {
    if (tokens.length < 1) {
        return emptySuggestions;
    }
    const data = await getTableData(hyperlinkSuggestion, widget);
    if (!data) {
        return emptySuggestions;
    }
    const headerName = getAndRemoveOneFromArray(tokens, 0);
    if (!headerName) {
        return emptySuggestions;
    }
    let suggestions = await parseHeaderSuggestionsWithHint(data, headerName);
    if (tokens.length < 1) {
        return suggestions;
    }
    suggestions = await parseRowSuggestionsWithHint(tokens, data, headerName);
    return suggestions;
};

const parseHeaderSuggestionsWithHint = async (data: TableData, headerName: string): Promise<SuggestionsData> => {
    const suggestions = data.headers.
        filter(({name}) => name.includes(headerName)).
        map(({name}) => ({
            id: name,
            text: name,
        }));
    return {suggestions};
};

const parseRowSuggestionsWithHint = async (
    tokens: string[],
    data: TableData,
    headerName: string,
): Promise<SuggestionsData> => {
    const value = getAndRemoveOneFromArray(tokens, 0);
    if (!value) {
        return emptySuggestions;
    }
    const {headers, rows} = data;
    const index = headers.findIndex(({name}) => name === headerName);
    if (index === -1) {
        return emptySuggestions;
    }
    const rowPairs = findRowPairsWithHint(rows, index, value);
    if (rowPairs.length < 1) {
        return emptySuggestions;
    }
    return {suggestions: rowPairs};
};

const findRowPairsWithHint = (rows: TableRowData[], index: number, value: string): RowPair[] => {
    // Finds the row where the value at the same index of the requested column
    // is equal to the value provided
    const rowsByValue = rows.filter(({values}) => values[index].value.includes(value));
    if (!rowsByValue) {
        return [];
    }
    return rowsByValue.map(({id, values}) => ({
        id,
        text: values[index].value,
    }));
};

const getTableData = async (
    {object}: HyperlinkSuggestion,
    {url}: Widget,
): Promise<TableData | null> => {
    let widgetUrl = url as string;
    if (object) {
        widgetUrl = formatUrlWithId(widgetUrl, object.id);
    }
    const data = await fetchTableData(widgetUrl);
    if (!data) {
        return null;
    }
    return data;
};
