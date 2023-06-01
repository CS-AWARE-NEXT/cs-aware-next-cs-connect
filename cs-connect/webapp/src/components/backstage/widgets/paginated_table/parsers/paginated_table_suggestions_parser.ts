import {fetchSectionInfo} from 'src/clients';
import {getOrganizationById} from 'src/config/config';
import {
    TOKEN_SEPARATOR,
    ecosystemElementsFields,
    ecosystemElementsWidget,
    ecosystemRolesFields,
    ecosystemRolesWidget,
} from 'src/constants';
import {
    formatStringToCapitalize,
    formatStringToLowerCase,
    getAndRemoveOneFromArray,
    getWidgetTokens,
} from 'src/helpers';
import {Widget} from 'src/types/organization';
import {
    HyperlinkSuggestion,
    ParseOptions,
    SuggestionData,
    SuggestionsData,
} from 'src/types/parser';
import {Element, Role} from 'src/types/scenario_wizard';

const MAX_NUMBER_OF_TOKENS = 2;

const emptySuggestions = {suggestions: []};

export const parsePaginatedTableWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    if (getWidgetTokens(options?.clonedTokens, widget).length >= MAX_NUMBER_OF_TOKENS) {
        return emptySuggestions;
    }
    const columnOrRowName = parseColumnOrRowName(options?.reference as string);
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
    case ecosystemElementsWidget:
        return parseElementsWidgetSuggestions(sectionInfo.elements, columnOrRowName);
    default:
        return null;
    }
};

const parseRolesWidgetSuggestions = async (
    roles: Role[],
    columnOrRowName: string,
): Promise<SuggestionsData> => {
    const columns = ecosystemRolesFields;
    const isColumnNameGiven = columns.some((column) => column === columnOrRowName);
    if (isColumnNameGiven) {
        const suggestions = await parseRolesRowSuggestions(columnOrRowName, roles);
        return suggestions;
    }
    const suggestions = await parseColumnSuggestions(columns);
    return suggestions;
};

const parseRolesRowSuggestions = async (
    columnName: string,
    roles: Role[],
): Promise<SuggestionsData> => {
    let suggestions: SuggestionData[] = [];
    if (formatStringToLowerCase(columnName) === ecosystemRolesFields[0]) {
        suggestions = roles.map(({userId}) => ({
            id: userId,
            text: userId,
        }));
    }
    if (formatStringToLowerCase(columnName) === ecosystemRolesFields[1]) {
        // TODO: remove duplicates here
        suggestions = roles.map((role) => role.roles).
            flat().
            map((role) => ({
                id: role,
                text: role,
            }));
    }
    return {suggestions};
};

const parseElementsWidgetSuggestions = async (
    elements: Element[],
    columnOrRowName: string,
): Promise<SuggestionsData> => {
    const columns = ecosystemElementsFields;
    const isColumnNameGiven = columns.some((column) => column === columnOrRowName);
    if (isColumnNameGiven) {
        const suggestions = await parseElementsRowSuggestions(columnOrRowName, elements);
        return suggestions;
    }
    const suggestions = await parseColumnSuggestions(columns);
    return suggestions;
};

const parseElementsRowSuggestions = async (
    columnName: string,
    elements: Element[],
): Promise<SuggestionsData> => {
    let suggestions: SuggestionData[] = [];
    if (formatStringToLowerCase(columnName) === ecosystemElementsFields[0]) {
        // TODO: remove duplicates here
        suggestions = elements.map(({id, organizationId}) => ({
            id,
            text: getOrganizationById(organizationId).name,
        }));
    }
    if (formatStringToLowerCase(columnName) === ecosystemElementsFields[1]) {
        suggestions = elements.map(({id, name}) => ({
            id,
            text: name,
        }));
    }
    if (formatStringToLowerCase(columnName) === ecosystemElementsFields[2]) {
        // TODO: remove duplicates here
        suggestions = elements.
            filter(({description}) => description !== '').
            map(({id, description}) => ({
                id,
                text: description as string,
            }));
    }
    return {suggestions};
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
    if (tokens.length > MAX_NUMBER_OF_TOKENS) {
        return emptySuggestions;
    }
    let columnName = getAndRemoveOneFromArray(tokens, 0);
    if (!columnName) {
        return emptySuggestions;
    }
    columnName = formatStringToLowerCase(columnName);

    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return emptySuggestions;
    }
    switch (formatStringToLowerCase(name as string)) {
    case ecosystemRolesWidget:
        return parseRolesWidgetSuggestionsWithHint(tokens, sectionInfo.roles, columnName);
    case ecosystemElementsWidget:
        return parseElementsWidgetSuggestionsWithHint(tokens, sectionInfo.elements, columnName);
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
    let suggestions = await parseColumnSuggestions(columns, columnName);
    if (tokens.length < 1) {
        return suggestions;
    }
    suggestions = await parseRolesRowSuggestionsWithHint(tokens, roles, columnName);
    return suggestions;
};

const parseRolesRowSuggestionsWithHint = async (
    tokens: string[],
    roles: Role[],
    columnName: string,
): Promise<SuggestionsData> => {
    const value = getAndRemoveOneFromArray(tokens, 0);
    if (!value) {
        return emptySuggestions;
    }
    let suggestions: SuggestionData[] = [];
    if (columnName === ecosystemRolesFields[0]) {
        suggestions = roles.
            filter(({userId}) => userId.includes(value)).
            map(({userId}) => ({
                id: userId,
                text: userId,
            }));
    }
    if (columnName === ecosystemRolesFields[1]) {
        // TODO: remove duplicates here
        suggestions = roles.map((role) => role.roles).
            flat().
            filter((role) => role.includes(value)).
            map((role) => ({
                id: role,
                text: role,
            }));
    }
    return {suggestions};
};

const parseElementsWidgetSuggestionsWithHint = async (
    tokens: string[],
    elements: Element[],
    columnName: string,
): Promise<SuggestionsData> => {
    const columns = ecosystemElementsFields;
    let suggestions = await parseColumnSuggestions(columns, columnName);
    if (tokens.length < 1) {
        return suggestions;
    }
    suggestions = await parseElementsRowSuggestionsWithHint(tokens, elements, columnName);
    return suggestions;
};

const parseElementsRowSuggestionsWithHint = async (
    tokens: string[],
    elements: Element[],
    columnName: string,
): Promise<SuggestionsData> => {
    const value = getAndRemoveOneFromArray(tokens, 0);
    if (!value) {
        return emptySuggestions;
    }
    let suggestions: SuggestionData[] = [];
    if (columnName === ecosystemElementsFields[0]) {
        // TODO: remove duplicates here
        suggestions = elements.
            filter(({organizationId}) => getOrganizationById(organizationId).name.includes(value)).
            map(({organizationId}, index) => ({
                id: `${organizationId}-${index}`,
                text: getOrganizationById(organizationId).name,
            }));
    }
    if (columnName === ecosystemElementsFields[1]) {
        suggestions = elements.
            filter(({name}) => name.includes(value)).
            map(({id, name}) => ({
                id,
                text: name,
            }));
    }
    if (columnName === ecosystemElementsFields[2]) {
        // TODO: remove duplicates here
        suggestions = elements.
            filter(({description}) => description !== '' && description?.includes(value)).
            map(({id, description}) => ({
                id,
                text: description as string,
            }));
    }
    return {suggestions};
};

const parseColumnSuggestions = async (
    columns: string[],
    columnName?: string,
): Promise<SuggestionsData> => {
    const filteredColumns = columnName ? columns.filter((column) => column.includes(columnName)) : columns;
    const suggestions = filteredColumns.map((column) => ({
        id: column,
        text: formatStringToCapitalize(column),
    }));
    return {suggestions};
};

// Needed to understand if to provide all suggestions for the header or for the row
const parseColumnOrRowName = (reference: string): string => {
    const tokens = reference.
        split(TOKEN_SEPARATOR).
        filter((token) => token !== '');
    return formatStringToLowerCase(tokens[tokens.length - 1]);
};