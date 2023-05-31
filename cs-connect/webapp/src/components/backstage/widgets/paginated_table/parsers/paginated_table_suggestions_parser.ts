import {fetchSectionInfo} from 'src/clients';
import {TOKEN_SEPARATOR, ecosystemRolesFields, ecosystemRolesWidget} from 'src/constants';
import {formatStringToLowerCase, getAndRemoveOneFromArray} from 'src/helpers';
import {Widget} from 'src/types/organization';
import {
    HyperlinkSuggestion,
    ParseOptions,
    SuggestionData,
    SuggestionsData,
} from 'src/types/parser';
import {Role} from 'src/types/scenario_wizard';

const emptySuggestions = {suggestions: []};

export const parsePaginatedTableWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    reference: string,
    widget: Widget,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    const columnOrRowName = parseColumnOrRowName(reference);
    if (!options?.isIssues) {
        // TODO: add here logic for classic widget, not only ecosystem
        return emptySuggestions;
    }
    const suggestions = await parseIssuesWidgetSuggestions(hyperlinkSuggestion, widget, columnOrRowName);
    if (!suggestions) {
        return emptySuggestions;
    }
    return suggestions;
};

const parseIssuesWidgetSuggestions = async (
    {object, section}: HyperlinkSuggestion,
    {name}: Widget,
    columnOrRowName: string,
): Promise<SuggestionsData | null> => {
    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return emptySuggestions;
    }
    switch (formatStringToLowerCase(name as string)) {
    case ecosystemRolesWidget:
        return parseRolesWidgetSuggestions(sectionInfo.roles, columnOrRowName);
    default:
        return null;
    }
};

const parseRolesWidgetSuggestions = async (
    roles: Role[],
    columnOrRowName: string,
): Promise<SuggestionsData> => {
    const columns = ecosystemRolesFields;
    const rows = roles;
    const isColumnNameGiven = columns.some((column) => column === columnOrRowName);
    if (isColumnNameGiven) {
        const suggestions = await parseRolesRowSuggestions(columnOrRowName, rows);
        return suggestions;
    }
    const suggestions = await parseColumnSuggestions(columns);
    return suggestions;
};

const parseColumnSuggestions = async (columns: string[]): Promise<SuggestionsData> => {
    const suggestions = columns.
        map((column) => ({
            id: column,
            text: column,
        }));
    return {suggestions};
};

const parseRolesRowSuggestions = async (
    columnName: string,
    rows: Role[],
): Promise<SuggestionsData> => {
    let suggestions: SuggestionData[] = [];
    if (formatStringToLowerCase(columnName) === ecosystemRolesFields[0]) {
        suggestions = rows.map(({userId}) => ({
            id: userId,
            text: userId,
        }));
    }
    if (formatStringToLowerCase(columnName) === ecosystemRolesFields[1]) {
        // TODO: remove duplicates here
        suggestions = rows.map(({roles}) => roles).
            flat().
            map((role) => ({
                id: role,
                text: role,
            }));
    }
    return {suggestions};
};

// Needed to understand if to provide all suggestions for the header or for the row
const parseColumnOrRowName = (reference: string): string => {
    const tokens = reference.
        split(TOKEN_SEPARATOR).
        filter((token) => token !== '');
    return tokens[tokens.length - 1];
};

export const parsePaginatedTableWidgetSuggestionsWithHint = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
    widget: Widget,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    if (tokens.length < 1) {
        return emptySuggestions;
    }
    if (!options?.isIssues) {
        // TODO: add here logic for classic widget, not only ecosystem
        return emptySuggestions;
    }
    const suggestions = await parseIssuesWidgetSuggestionsWithHint(hyperlinkSuggestion, widget, tokens);
    if (!suggestions) {
        return emptySuggestions;
    }
    return suggestions;
};

const parseIssuesWidgetSuggestionsWithHint = async (
    {object, section}: HyperlinkSuggestion,
    {name}: Widget,
    tokens: string[],
): Promise<SuggestionsData | null> => {
    const columnName = getAndRemoveOneFromArray(tokens, 0);
    if (!columnName) {
        return emptySuggestions;
    }
    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return emptySuggestions;
    }
    switch (formatStringToLowerCase(name as string)) {
    case ecosystemRolesWidget:
        return parseRolesWidgetSuggestionsWithHint(tokens, sectionInfo.roles, columnName);
    default:
        return null;
    }
};

const parseRolesWidgetSuggestionsWithHint = async (
    tokens: string[],
    roles: Role[],
    columnName: string,
): Promise<SuggestionsData> => {
    const columns = ecosystemRolesFields;
    let suggestions = await parseColumnSuggestionsWithHint(columns, columnName);
    if (tokens.length < 1) {
        return suggestions;
    }
    suggestions = await parseRolesRowSuggestionsWithHint(tokens, roles, columnName);
    return suggestions;
};

const parseColumnSuggestionsWithHint = async (
    columns: string[],
    columnName: string,
): Promise<SuggestionsData> => {
    const suggestions = columns.
        filter((column) => column.includes(columnName)).
        map((column) => ({
            id: column,
            text: column,
        }));
    return {suggestions};
};

const parseRolesRowSuggestionsWithHint = async (
    tokens: string[],
    rows: Role[],
    columnName: string,
): Promise<SuggestionsData> => {
    const value = getAndRemoveOneFromArray(tokens, 0);
    if (!value) {
        return emptySuggestions;
    }
    let suggestions: SuggestionData[] = [];
    if (formatStringToLowerCase(columnName) === ecosystemRolesFields[0]) {
        suggestions = rows.
            filter(({userId}) => userId.includes(value)).
            map(({userId}) => ({
                id: userId,
                text: userId,
            }));
    }
    if (formatStringToLowerCase(columnName) === ecosystemRolesFields[1]) {
        // TODO: remove duplicates here
        suggestions = rows.map(({roles}) => roles).
            flat().
            filter((tole) => tole.includes(value)).
            map((role) => ({
                id: role,
                text: role,
            }));
    }
    return {suggestions};
};
