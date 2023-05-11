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
import {formatStringToCapitalize, getAndRemoveOneFromArray, isSectionByName} from 'src/hooks';
import {OBJECT_ID_TOKEN, TOKEN_SEPARATOR, ecosystemElementsWidget} from 'src/constants';
import {SuggestionData, SuggestionsData} from 'src/types/suggestions';

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

export const parseTokensToSuggestions = async (tokens: string[]): Promise<SuggestionsData> => {
    // if there's no string
    // --- return all organizations
    // search for organization and build suggestions
    // if there's no string
    // --- return the current suggestions
    // search for section and build suggestions
    // if there's no string
    // --- return the current suggestions
    // search for object and build suggestions
    // if there's no string
    // --- return the current suggestions
    // search for widget and build suggestions
    // if there's no string
    // --- return the current suggestions
    // search for widget' data and build suggestions (this has to be done based on widget type)

    // const organizationName = getAndRemoveOneFromArray(tokens, 0);
    // if (!organizationName) {
    //     return parseNoOrganizationSuggestions();
    // }
    // let suggestions = await parseOrganizationSuggestions(organizationName);
    // const sectionName = getAndRemoveOneFromArray(tokens, 0);
    // if (!sectionName) {
    //     return suggestions;
    // }

    // // TODO: think about adding support for organizations' widgets
    // suggestions = await parseSectionSuggestions(organizationName, sectionName);
    // const objectName = getAndRemoveOneFromArray(tokens, 0);
    // if (!objectName) {
    //     return suggestions;
    // }
    // return suggestions;

    let hyperlinkSuggestion: HyperlinkSuggestion = {suggestions: {suggestions: []}};
    try {
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseOrganizationSuggestions);

        // TODO: think about adding support for organizations' widgets
        // if (!isSectionByName(tokens[0])) {
        //     hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseWidgetSuggestion);
        //     return hyperlinkSuggestion.suggestions;
        // }
        hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseSectionSuggestions);

        // hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseObject);
        // hyperlinkSuggestion = await withTokensLengthCheck(hyperlinkSuggestion, tokens, parseWidgetHash);
    } catch (error: any) {
        if (error instanceof NoMoreTokensError) {
            return hyperlinkSuggestion.suggestions;
        }
        return hyperlinkSuggestion.suggestions;
    }
    return hyperlinkSuggestion.suggestions;
};

const parseNoOrganizationSuggestions = async (): Promise<SuggestionsData> => {
    const suggestions = getOrganizations().map<SuggestionData>(({id, name}) => ({
        id,
        text: name,
    }));
    return {suggestions};
};

const parseOrganizationSuggestions = async (hyperlinkSuggestion: HyperlinkSuggestion, tokens: string[]): Promise<HyperlinkSuggestion> => {
    const organizationName = getAndRemoveOneFromArray(tokens, 0);
    if (!organizationName) {
        return {...hyperlinkSuggestion, suggestions: await parseNoOrganizationSuggestions()};
    }
    const suggestions = getOrganizations().
        filter(({name}) => name.includes(organizationName)).
        map(({id, name}) => ({
            id,
            text: name,
        }));
    const organization = getOrganizationByName(organizationName);
    return {...hyperlinkSuggestion, organization, suggestions: {suggestions}};
};

const parseSectionSuggestions = async (hyperlinkSuggestion: HyperlinkSuggestion, tokens: string[]): Promise<HyperlinkSuggestion> => {
    const sectionName = getAndRemoveOneFromArray(tokens, 0);
    if (!sectionName) {
        return hyperlinkSuggestion;
    }
    const organizationName = hyperlinkSuggestion.organization?.name as string;
    const suggestions = getOrganizationByName(organizationName).sections.
        filter(({name}) => name.includes(sectionName)).
        map(({id, name}) => ({
            id,
            text: name,
        }));
    const section = hyperlinkSuggestion.organization?.sections.filter((s) => s.name === sectionName)[0];
    return {...hyperlinkSuggestion, section, suggestions: {suggestions}};
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
    if (Object.keys(widgetHash).some((key) => !key)) {
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