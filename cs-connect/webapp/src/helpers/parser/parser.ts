import {
    END_SYMBOL,
    getOrganizationByName,
    getOrganizations,
    getStartSymbol,
    getSymbol,
} from 'src/config/config';
import {HyperlinkReference, HyperlinkSuggestion, WidgetHash} from 'src/types/parser';
import {fetchPaginatedTableData} from 'src/clients';
import {Widget} from 'src/types/organization';
import {WidgetType} from 'src/components/backstage/widgets/widget_types';
import {buildTextBoxWidgetId} from 'src/components/backstage/widgets/text_box/providers/text_box_id_provider';
import {buildTableWidgetId} from 'src/components/backstage/widgets/table/providers/table_id_provider';
import {buildGraphWidgetId} from 'src/components/backstage/widgets/graph/providers/graph_id_provider';
import {
    formatStringToCapitalize,
    getAndRemoveOneFromArray,
    getDefaultSuggestions,
    getOrganizationsSuggestions,
    isAnyPropertyMissingFromObject,
} from 'src/helpers';
import {isSectionByName} from 'src/hooks';
import {OBJECT_ID_TOKEN, TOKEN_SEPARATOR, ecosystemElementsWidget} from 'src/constants';
import {SuggestionsData} from 'src/types/suggestions';

import NoMoreTokensError from './errors/noMoreTokensError';
import ParseError from './errors/parseError';

export const parseTextToReference = (text: string, start: number): string => {
    const symbolStartIndex = text.lastIndexOf(getStartSymbol(), start);
    if (symbolStartIndex === -1) {
        return '';
    }
    let reference = text.substring(symbolStartIndex);
    const endSymbolIndex = reference.indexOf(END_SYMBOL);
    if (endSymbolIndex !== -1) {
        reference = reference.substring(0, endSymbolIndex);
    }
    reference = reference.substring(getStartSymbol().length);
    return reference;
};

export const parseTextToTokens = (text: string, start: number): string[] => {
    const reference = parseTextToReference(text, start);
    const tokens = reference.split(TOKEN_SEPARATOR);
    return tokens.filter((token) => token !== '');
};

export const parseTokensToSuggestions = async (tokens: string[], reference: string): Promise<SuggestionsData> => {
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

// TODO: implement this function properly
const updateIfEndsWithTokenSeparator = async (hyperlinkSuggestion: HyperlinkSuggestion, reference: string): Promise<HyperlinkSuggestion> => {
    if (reference === '') {
        return {...hyperlinkSuggestion, suggestions: getOrganizationsSuggestions()};
    }
    if (!reference.endsWith(TOKEN_SEPARATOR)) {
        return hyperlinkSuggestion;
    }
    if (!hyperlinkSuggestion.organization) {
        return {...hyperlinkSuggestion, suggestions: getOrganizationsSuggestions()};
    }
    if (!hyperlinkSuggestion.section) {
        const suggestions = getOrganizationByName(hyperlinkSuggestion.organization?.name as string).
            sections.map(({id, name}) => ({id, text: name}));
        return {...hyperlinkSuggestion, suggestions: {suggestions}};
    }
    if (!hyperlinkSuggestion.object) {
        const url = hyperlinkSuggestion.section?.url as string;
        const data = await fetchPaginatedTableData(url);
        if (!data) {
            return {...hyperlinkSuggestion, suggestions: getDefaultSuggestions()};
        }
        const suggestions = data.rows.map(({id, name}) => ({id, text: name}));
        return {...hyperlinkSuggestion, suggestions: {suggestions}};
    }
    return hyperlinkSuggestion;
};

const parseNoOrganizationSuggestions = async (): Promise<SuggestionsData> => {
    const suggestions = getOrganizations().map(({id, name}) => ({id, text: name}));
    return {suggestions};
};

const parseOrganizationSuggestions = async (hyperlinkSuggestion: HyperlinkSuggestion, tokens: string[]): Promise<HyperlinkSuggestion> => {
    const organizationName = getAndRemoveOneFromArray(tokens, 0);
    if (!organizationName) {
        return {...hyperlinkSuggestion, suggestions: await parseNoOrganizationSuggestions()};
    }
    const organization = getOrganizationByName(organizationName);
    const suggestions = getOrganizations().
        filter(({name}) => name.includes(organizationName)).
        map(({id, name}) => ({id, text: name}));
    return {...hyperlinkSuggestion, organization, suggestions: {suggestions}};
};

const parseSectionSuggestions = async (hyperlinkSuggestion: HyperlinkSuggestion, tokens: string[]): Promise<HyperlinkSuggestion> => {
    const sectionName = getAndRemoveOneFromArray(tokens, 0);
    if (!sectionName) {
        return hyperlinkSuggestion;
    }
    const organizationName = hyperlinkSuggestion.organization?.name as string;
    const section = hyperlinkSuggestion.organization?.sections.filter((s) => s.name === sectionName)[0];
    const suggestions = getOrganizationByName(organizationName).sections.
        filter(({name}) => name.includes(sectionName)).
        map(({id, name}) => ({id, text: name}));
    return {...hyperlinkSuggestion, section, suggestions: {suggestions}};
};

const parseObjectSuggestions = async (hyperlinkSuggestion: HyperlinkSuggestion, tokens: string[]): Promise<HyperlinkSuggestion> => {
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
        map(({id, name}) => ({id, text: name}));
    return {...hyperlinkSuggestion, object, suggestions: {suggestions}};
};

const parseWidgetSuggestions = async (hyperlinkSuggestion: HyperlinkSuggestion, tokens: string[]): Promise<HyperlinkSuggestion> => {
    console.log('parseWidgetSuggestions');
    const widgetName = getAndRemoveOneFromArray(tokens, 0);
    if (!widgetName) {
        console.log('no widgetName');
        return hyperlinkSuggestion;
    }
    const widgets = hyperlinkSuggestion.section?.widgets;
    if (!widgets || widgets.length < 1) {
        console.log('no widgets');
        return hyperlinkSuggestion;
    }
    const suggestions = widgets.
        filter(({name}) => name?.includes(widgetName)).
        map(({name, type}) => ({id: `${name}-${type}`, text: name as string}));
    console.log('widget suggestions: ', JSON.stringify(suggestions, null, 2));

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
    return {...hyperlinkSuggestion, suggestions: {suggestions}};
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

export const parseMatchToTokens = (match: string): string[] => {
    const reference = extractReferenceFromMatch(match);
    if (reference === null) {
        return [];
    }
    const tokens = reference.split(TOKEN_SEPARATOR);
    return tokens.filter((token) => token !== '');
};

// TODO: Add support for the issues' elements default section
export const parseTokensToHyperlinkReference = async (tokens: string[]): Promise<HyperlinkReference | null> => {
    let hyperlinkReference: HyperlinkReference = {};
    try {
        hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseOrganization);
        if (!isSectionByName(tokens[0])) {
            hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseWidgetHash);
            return hyperlinkReference;
        }
        hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseSection);
        hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseObject);
        hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseWidgetHash);
    } catch (error: any) {
        if (error instanceof NoMoreTokensError) {
            return hyperlinkReference;
        }
        return null;
    }
    return hyperlinkReference;
};

const extractReferenceFromMatch = (match: string): string | null => {
    if (match === `${getSymbol()}()`) {
        return null;
    }
    return match.substring(getSymbol().length + 1, match.length - 1);
};

const parseOrganization = async (hyperlinkReference: HyperlinkReference, tokens: string[]): Promise<HyperlinkReference> => {
    const organizationName = getAndRemoveOneFromArray(tokens, 0);
    if (!organizationName) {
        throw new ParseError('Cannot get organization\'s name');
    }
    const organization = getOrganizationByName(organizationName);
    if (!organization) {
        throw new ParseError(`Cannot find organization named ${organizationName}`);
    }
    return {...hyperlinkReference, organization};
};

// TODO: Add handling for section hash (use the # character)
const parseSection = async (hyperlinkReference: HyperlinkReference, tokens: string[]): Promise<HyperlinkReference> => {
    const sectionName = getAndRemoveOneFromArray(tokens, 0);
    if (!sectionName) {
        return hyperlinkReference;
    }
    const section = hyperlinkReference.organization?.sections.filter((s) => s.name === sectionName)[0];
    if (!section) {
        throw new ParseError(`Cannot find section named ${sectionName}`);
    }
    return {...hyperlinkReference, section};
};

const parseObject = async (hyperlinkReference: HyperlinkReference, tokens: string[]): Promise<HyperlinkReference> => {
    const objectName = getAndRemoveOneFromArray(tokens, 0);
    if (!objectName) {
        return hyperlinkReference;
    }
    const url = hyperlinkReference.section?.url as string;
    const data = await fetchPaginatedTableData(url);
    if (!data) {
        throw new ParseError(`Cannot get data for object named ${objectName}`);
    }
    const object = data.rows.filter((row) => row.name === objectName)[0];
    if (!object) {
        throw new ParseError(`Cannot find object named ${objectName}`);
    }
    return {...hyperlinkReference, object};
};

const parseWidgetHash = async (hyperlinkReference: HyperlinkReference, tokens: string[]): Promise<HyperlinkReference> => {
    const widgetName = getAndRemoveOneFromArray(tokens, 0);
    if (!widgetName) {
        return hyperlinkReference;
    }
    let widget = hyperlinkReference.section?.widgets.filter(({name}) => name === widgetName)[0];
    if (!widget && hyperlinkReference.organization?.isEcosystem) {
        // If the organization is the ecosystem, check for reference to the default widget
        widget = {
            name: formatStringToCapitalize(ecosystemElementsWidget),
            type: WidgetType.PaginatedTable,
            url: `${hyperlinkReference.section?.url}/${OBJECT_ID_TOKEN}`,
        };
    }
    if (!widget) {
        // If the section is not found, check whether it is a reference to a object's widget
        widget = hyperlinkReference.organization?.widgets.filter(({name}) => name === widgetName)[0];
        if (!widget) {
            return hyperlinkReference;
        }
    }
    console.log('Widget: ' + JSON.stringify(widget));
    const widgetHash = await parseWidgetHashByType(hyperlinkReference, tokens, widget);
    if (isAnyPropertyMissingFromObject(widgetHash)) {
        return hyperlinkReference;
    }
    return {...hyperlinkReference, widgetHash};
};

const parseWidgetHashByType = (
    hyperlinkReference: HyperlinkReference,
    tokens: string[],
    widget: Widget,
): WidgetHash | Promise<WidgetHash> => {
    switch (widget.type) {
    case WidgetType.Graph:
        return buildGraphWidgetId(hyperlinkReference, tokens, widget);
    case WidgetType.PaginatedTable:
        return {hash: '', text: ''};
    case WidgetType.List:
        return {hash: '', text: ''};
    case WidgetType.Table:
        return buildTableWidgetId(hyperlinkReference, tokens, widget);
    case WidgetType.TextBox:
        return buildTextBoxWidgetId(hyperlinkReference, widget);
    case WidgetType.Timeline:
        return {hash: '', text: ''};
    default:
        return {hash: '', text: ''};
    }
};

const withTokensLengthCheck = async <T>(
    obj: T,
    tokens: string[],
    parse: (obj: T, tokens: string[]) => Promise<T>,
): Promise<T> => {
    if (tokens.length < 1) {
        throw new NoMoreTokensError('No more tokens to parse');
    }
    return parse(obj, tokens);
};
