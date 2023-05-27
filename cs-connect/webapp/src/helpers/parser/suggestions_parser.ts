import {
    HyperlinkSuggestion,
    ParseOptions,
    SuggestionsData,
    WidgetSuggestionsOptions,
} from 'src/types/parser';
import {getAndRemoveOneFromArray, getEmptySuggestions, getOrganizationsSuggestions} from 'src/helpers';
import {TOKEN_SEPARATOR} from 'src/constants';
import {getOrganizationByName, getOrganizations} from 'src/config/config';
import {fetchPaginatedTableData} from 'src/clients';
import {WidgetType} from 'src/components/backstage/widgets/widget_types';
import {Widget} from 'src/types/organization';
import {parseTableWidgetSuggestions, parseTableWidgetSuggestionsWithHint} from 'src/components/backstage/widgets/table/parsers/table_suggestions_parser';
import {parseTextBoxWidgetSuggestions} from 'src/components/backstage/widgets/text_box/parsers/text_box_suggestions_parser';
import {parseListWidgetSuggestions, parseListWidgetSuggestionsWithHint} from 'src/components/backstage/widgets/list/parsers/list_suggestions_parser';

import {getDefaultsWidgets, withTokensLengthCheck} from './parser';
import NoMoreTokensError from './errors/noMoreTokensError';
import ParseError from './errors/parseError';

export const parseTokensToSuggestions = async (
    tokens: string[],
    reference: string,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    let hyperlinkSuggestion: HyperlinkSuggestion = {suggestions: {suggestions: []}};
    try {
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseOrganizationSuggestions);

        // TODO: think about adding support for organizations' widgets suggestions
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseSectionSuggestions);
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseObjectSuggestions);
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseWidgetSuggestions, options);
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseWidgetElementSuggestionsWithHint);
    } catch (error: any) {
        if (error instanceof NoMoreTokensError) {
            hyperlinkSuggestion = await updateIfEndsWithTokenSeparator(hyperlinkSuggestion, tokens, reference, options);
        }
        return hyperlinkSuggestion.suggestions;
    }
    hyperlinkSuggestion = await updateIfEndsWithTokenSeparator(hyperlinkSuggestion, tokens, reference, options);
    return hyperlinkSuggestion.suggestions;
};

// TODO: implement this function properly, and refactor later
// Separate into two functions: one for reference === '' and the other for references ending with the dot
const updateIfEndsWithTokenSeparator = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
    reference: string,
    options?: ParseOptions,
): Promise<HyperlinkSuggestion> => {
    // TODO: this may not be needed, since it is managed in the input handler of the textarea
    // if (reference === '') {
    //     return {...hyperlinkSuggestion, suggestions: getOrganizationsSuggestions()};
    // }
    if (!reference.endsWith(TOKEN_SEPARATOR)) {
        return hyperlinkSuggestion;
    }
    if (!hyperlinkSuggestion.organization) {
        return {...hyperlinkSuggestion, suggestions: getOrganizationsSuggestions()};
    }
    if (!hyperlinkSuggestion.section) {
        const suggestions = getOrganizationByName(hyperlinkSuggestion.organization?.name as string).
            sections.map(({id, name}) => ({
                id,
                text: name,
            }));
        return {...hyperlinkSuggestion, suggestions: {suggestions}};
    }
    if (!hyperlinkSuggestion.object) {
        const url = hyperlinkSuggestion.section?.url as string;
        const data = await fetchPaginatedTableData(url);
        if (!data) {
            return {...hyperlinkSuggestion, suggestions: getEmptySuggestions()};
        }
        const suggestions = data.rows.map(({id, name}) => ({
            id,
            text: name,
        }));
        return {...hyperlinkSuggestion, suggestions: {suggestions}};
    }
    if (!hyperlinkSuggestion.widget) {
        const widgets = buildWidgets(hyperlinkSuggestion, options);
        if (!widgets || widgets.length < 1) {
            return hyperlinkSuggestion;
        }
        const suggestions = widgets.
            filter(({name}) => name && name !== '').
            map(({name, type}) => ({
                id: `${name}-${type}`,
                text: name as string,
            }));
        return {...hyperlinkSuggestion, suggestions: {suggestions}};
    }
    const widget = hyperlinkSuggestion.widget as Widget;
    const suggestions = await parseWidgetElementSuggestionsByType(hyperlinkSuggestion, tokens, widget, {reference});
    return {...hyperlinkSuggestion, suggestions};
};

const parseNoOrganizationSuggestions = async (): Promise<SuggestionsData> => {
    const suggestions = getOrganizations().map(({id, name}) => ({id, text: name}));
    return {suggestions};
};

const parseOrganizationSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
): Promise<HyperlinkSuggestion> => {
    const organizationName = getAndRemoveOneFromArray(tokens, 0);
    if (!organizationName) {
        return {...hyperlinkSuggestion, suggestions: await parseNoOrganizationSuggestions()};
    }
    const organization = getOrganizationByName(organizationName);
    const suggestions = getOrganizations().
        filter(({name}) => name.includes(organizationName)).
        map(({id, name}) => ({
            id,
            text: name,
        }));
    return {...hyperlinkSuggestion, organization, suggestions: {suggestions}};
};

// TODO: add support for issues' elements default section
const parseSectionSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
): Promise<HyperlinkSuggestion> => {
    const sectionName = getAndRemoveOneFromArray(tokens, 0);
    if (!sectionName) {
        return hyperlinkSuggestion;
    }
    const organizationName = hyperlinkSuggestion.organization?.name as string;
    const section = hyperlinkSuggestion.organization?.sections.filter((s) => s.name === sectionName)[0];
    const suggestions = getOrganizationByName(organizationName).sections.
        filter(({name}) => name.includes(sectionName)).
        map(({id, name}) => ({
            id,
            text: name,
        }));
    return {...hyperlinkSuggestion, section, suggestions: {suggestions}};
};

const parseObjectSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
): Promise<HyperlinkSuggestion> => {
    const objectName = getAndRemoveOneFromArray(tokens, 0);
    if (!objectName) {
        return hyperlinkSuggestion;
    }
    const url = hyperlinkSuggestion.section?.url as string;
    const data = await fetchPaginatedTableData(url);
    if (!data) {
        throw new ParseError(`Cannot get data for object named ${objectName}`);
    }
    const object = data.rows.filter((row) => row.name === objectName)[0];
    const suggestions = data.rows.
        filter(({name}) => name.includes(objectName)).
        map(({id, name}) => ({
            id,
            text: name,
        }));
    return {...hyperlinkSuggestion, object, suggestions: {suggestions}};
};

const parseWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
    options?: ParseOptions,
): Promise<HyperlinkSuggestion> => {
    const widgetName = getAndRemoveOneFromArray(tokens, 0);
    if (!widgetName) {
        return hyperlinkSuggestion;
    }
    const widgets = buildWidgets(hyperlinkSuggestion, options);
    if (!widgets || widgets.length < 1) {
        return hyperlinkSuggestion;
    }
    const widget = widgets.filter(({name}) => name === widgetName)[0];
    const suggestions = widgets.
        filter(({name}) => name?.includes(widgetName)).
        map(({name, type}) => ({
            id: `${name}-${type}`,
            text: name as string,
        }));
    return {...hyperlinkSuggestion, widget, suggestions: {suggestions}};
};

const parseWidgetElementSuggestionsWithHint = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
): Promise<HyperlinkSuggestion> => {
    const widget = hyperlinkSuggestion.widget as Widget;
    const suggestions = await parseWidgetElementSuggestionsByType(hyperlinkSuggestion, tokens, widget, {withHint: true});
    return {...hyperlinkSuggestion, suggestions};
};

const parseWidgetElementSuggestionsByType = (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
    widget: Widget,
    options?: WidgetSuggestionsOptions,
): SuggestionsData | Promise<SuggestionsData> => {
    const isHintGiven = options?.withHint || false;
    switch (widget.type) {
    case WidgetType.Graph:
        return {suggestions: []};
    case WidgetType.PaginatedTable:
        return {suggestions: []};
    case WidgetType.List:
        if (isHintGiven) {
            return parseListWidgetSuggestionsWithHint(hyperlinkSuggestion, tokens, widget);
        }
        return parseListWidgetSuggestions(hyperlinkSuggestion, widget);
    case WidgetType.Table:
        if (isHintGiven) {
            return parseTableWidgetSuggestionsWithHint(hyperlinkSuggestion, tokens, widget);
        }
        return parseTableWidgetSuggestions(hyperlinkSuggestion, options?.reference as string, widget);
    case WidgetType.TextBox:
        return parseTextBoxWidgetSuggestions();
    case WidgetType.Timeline:
        return {suggestions: []};
    default:
        return {suggestions: []};
    }
};

const buildWidgets = (
    hyperlinkSuggestion: HyperlinkSuggestion,
    options?: ParseOptions,
): Widget[] => {
    const configWidgets = hyperlinkSuggestion.section?.widgets;
    if (!hyperlinkSuggestion.organization?.isEcosystem) {
        return configWidgets || [];
    }
    const defaultWidgets = getDefaultsWidgets(hyperlinkSuggestion.section, options?.isRhsReference);
    return configWidgets ? [...defaultWidgets, ...configWidgets] : defaultWidgets;
};
