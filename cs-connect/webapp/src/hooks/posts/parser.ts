import {getOrganizationByName, getSymbol} from 'src/config/config';
import {HyperlinkReference, WidgetHash} from 'src/types/parser';
import {fetchPaginatedTableData} from 'src/clients';

import {Widget} from 'src/types/organization';
import {WidgetType} from 'src/components/backstage/widgets/widget_types';
import {buildTextBoxWidgetId} from 'src/components/backstage/widgets/text_box/providers/text_box_id_provider';
import {buildTableWidgetId} from 'src/components/backstage/widgets/table/providers/table_id_provider';

import NoMoreTokensError from './errors/noMoreTokensError';
import ParseError from './errors/parseError';

export const parseMatchToTokens = (match: string): string[] => {
    const reference = extractReferenceFromMatch(match);
    if (reference === null) {
        return [];
    }
    const tokens = reference.split('.');
    return tokens.filter((token) => token !== '');
};

export const parseTokensToHyperlinkReference = async (tokens: string[]): Promise<HyperlinkReference | null> => {
    let hyperlinkReference: HyperlinkReference = {};
    try {
        hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseOrganization);

        // TODO: Add check for if the next token references a section or a organization's widget
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
    const organizationName = tokens.splice(0, 1)[0];
    const organization = getOrganizationByName(organizationName);
    if (!organization) {
        throw new ParseError(`Cannot find organization named ${organizationName}`);
    }
    return {...hyperlinkReference, organization};
};

// TODO: had handling for section hash (use the # character)
const parseSection = async (hyperlinkReference: HyperlinkReference, tokens: string[]): Promise<HyperlinkReference> => {
    const sectionName = tokens.splice(0, 1)[0];
    const section = hyperlinkReference.organization?.sections.filter((s) => s.name === sectionName)[0];
    if (!section) {
        throw new ParseError(`Cannot find section named ${sectionName}`);
    }
    return {...hyperlinkReference, section};
};

const parseObject = async (hyperlinkReference: HyperlinkReference, tokens: string[]): Promise<HyperlinkReference> => {
    const objectName = tokens.splice(0, 1)[0];
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
    const widgetName = tokens.splice(0, 1)[0];
    const widget = hyperlinkReference.section?.widgets.filter(({name}) => name === widgetName)[0];
    if (!widget) {
        return hyperlinkReference;
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
        return {hash: '', text: ''};
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