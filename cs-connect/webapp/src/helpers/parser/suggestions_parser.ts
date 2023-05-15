import {HyperlinkSuggestion} from 'src/types/parser';
import {getAndRemoveOneFromArray, getDefaultSuggestions, getOrganizationsSuggestions} from 'src/helpers';
import {TOKEN_SEPARATOR} from 'src/constants';
import {getOrganizationByName, getOrganizations} from 'src/config/config';
import {fetchPaginatedTableData} from 'src/clients';
import {SuggestionsData} from 'src/types/suggestions';
import {WidgetType} from 'src/components/backstage/widgets/widget_types';
import {Widget} from 'src/types/organization';

import {withTokensLengthCheck} from './parser';
import NoMoreTokensError from './errors/noMoreTokensError';
import ParseError from './errors/parseError';

export const parseTokensToSuggestions = async (
    tokens: string[],
    reference: string,
): Promise<SuggestionsData> => {
    let hyperlinkSuggestion: HyperlinkSuggestion = {suggestions: {suggestions: []}};
    try {
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseOrganizationSuggestions);

        // TODO: think about adding support for organizations' widgets suggestions
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseSectionSuggestions);
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseObjectSuggestions);
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseWidgetSuggestions);
    } catch (error: any) {
        if (error instanceof NoMoreTokensError) {
            hyperlinkSuggestion = await updateIfEndsWithTokenSeparator(hyperlinkSuggestion, reference);
        }
        return hyperlinkSuggestion.suggestions;
    }
    hyperlinkSuggestion = await updateIfEndsWithTokenSeparator(hyperlinkSuggestion, reference);
    return hyperlinkSuggestion.suggestions;
};

// TODO: implement this function properly, and refactor later
// Separate into two functions: one for reference === '' and the other for references ending with the dot
const updateIfEndsWithTokenSeparator = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    reference: string,
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
            return {...hyperlinkSuggestion, suggestions: getDefaultSuggestions()};
        }
        const suggestions = data.rows.map(({id, name}) => ({
            id,
            text: name,
        }));
        return {...hyperlinkSuggestion, suggestions: {suggestions}};
    }
    if (!hyperlinkSuggestion.widget) {
        const widgets = hyperlinkSuggestion.section?.widgets;
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
    return hyperlinkSuggestion;
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
): Promise<HyperlinkSuggestion> => {
    const widgetName = getAndRemoveOneFromArray(tokens, 0);
    if (!widgetName) {
        return hyperlinkSuggestion;
    }
    const widgets = hyperlinkSuggestion.section?.widgets;
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

    // TODO: implement the function with the following logic to get suggestions for widgets' elements
    // if (!widget && hyperlinkSuggestion.organization?.isEcosystem) {
    //     // If the organization is the ecosystem, check for reference to the default widget
    //     widget = {
    //         name: formatStringToCapitalize(ecosystemElementsWidget),
    //         type: WidgetType.PaginatedTable,
    //         url: `${hyperlinkSuggestion.section?.url}/${OBJECT_ID_TOKEN}`,
    //     };
    // }
    // if (!widget) {
    //     // If the section is not found, check whether it is a reference to a object's widget
    //     widget = hyperlinkSuggestion.organization?.widgets.filter(({name}) => name === widgetName)[0];
    //     if (!widget) {
    //         return hyperlinkSuggestion;
    //     }
    // }
    // console.log('Widget for suggestions: ' + JSON.stringify(widget));
    // const suggestions = await parseWidgetSuggestionsByType(hyperlinkSuggestion, tokens, widget);
    return {...hyperlinkSuggestion, widget, suggestions: {suggestions}};
};

const parseWidgetSuggestionsByType = (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
    widget: Widget,
): SuggestionsData | Promise<SuggestionsData> => {
    switch (widget.type) {
    case WidgetType.Graph:
        return {suggestions: []};
    case WidgetType.PaginatedTable:
        return {suggestions: []};
    case WidgetType.List:
        return {suggestions: []};
    case WidgetType.Table:
        return {suggestions: []};
    case WidgetType.TextBox:
        return {suggestions: []};
    case WidgetType.Timeline:
        return {suggestions: []};
    default:
        return {suggestions: []};
    }
};