import {
    END_SYMBOL,
    getOrganizationByName,
    getOrganizations,
    getStartSymbol,
    getSymbol,
} from 'src/config/config';
import {HyperlinkReference, WidgetHash} from 'src/types/parser';
import {fetchPaginatedTableData} from 'src/clients';
import {Widget} from 'src/types/organization';
import {WidgetType} from 'src/components/backstage/widgets/widget_types';
import {buildTextBoxWidgetId} from 'src/components/backstage/widgets/text_box/providers/text_box_id_provider';
import {buildTableWidgetId} from 'src/components/backstage/widgets/table/providers/table_id_provider';
import {buildGraphWidgetId} from 'src/components/backstage/widgets/graph/providers/graph_id_provider';
import {getAndRemoveOneFromArray, isSectionByName} from 'src/hooks';
import {TOKEN_SEPARATOR} from 'src/constants';
import {SuggestionData, SuggestionsData} from 'src/types/suggestions';

import NoMoreTokensError from './errors/noMoreTokensError';
import ParseError from './errors/parseError';

export const parseTextToTokens = (text: string, start: number): string[] => {
    const symbolStartIndex = text.lastIndexOf(getStartSymbol(), start);
    if (symbolStartIndex === -1) {
        return [];
    }
    let reference = text.substring(symbolStartIndex);
    const endSymbolIndex = reference.indexOf(END_SYMBOL);
    if (endSymbolIndex !== -1) {
        reference = reference.substring(0, endSymbolIndex);
    }
    reference = reference.substring(getStartSymbol().length);
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
    if (tokens.length < 1) {
        return parseOrganizationSuggestions();
    }
    return {suggestions: []};
};

const parseOrganizationSuggestions = async (): Promise<SuggestionsData> => {
    const suggestions = getOrganizations().map<SuggestionData>(({id, name}) => ({
        id,
        text: name,
    }));
    return {suggestions};
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

const withTokensLengthCheck = async (
    hyperlinkReference: HyperlinkReference,
    tokens: string[],
    parse: (hyperlinkReference: HyperlinkReference, tokens: string[]) => Promise<HyperlinkReference>,
): Promise<HyperlinkReference> => {
    if (tokens.length < 1) {
        throw new NoMoreTokensError('No more tokens to parse');
    }
    return parse(hyperlinkReference, tokens);
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
    if (!widget) {
        // If the section is not found, check whether it is a reference to a object's widget
        widget = hyperlinkReference.organization?.widgets.filter(({name}) => name === widgetName)[0];
        if (!widget) {
            return hyperlinkReference;
        }
    }
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