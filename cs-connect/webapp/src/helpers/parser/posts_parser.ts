import {
    HyperlinkReference,
    ParseOptions,
    WidgetHash,
    WidgetHashOrObjectForward,
} from 'src/types/parser';
import {getAndRemoveOneFromArray, isAnyPropertyMissingFromObject} from 'src/helpers';
import {getOrganizationByName} from 'src/config/config';
import {fetchPaginatedTableData} from 'src/clients';
import {WidgetType} from 'src/components/backstage/widgets/widget_types';
import {parseTableWidgetId} from 'src/components/backstage/widgets/table/parsers/table_posts_parser';
import {parseTextBoxWidgetId} from 'src/components/backstage/widgets/text_box/parsers/text_box_posts_parser';
import {parseGraphWidgetId} from 'src/components/backstage/widgets/graph/parsers/graph_posts_parser';
import {Widget} from 'src/types/organization';
import {isSectionByName} from 'src/hooks';
import {parseListWidgetId} from 'src/components/backstage/widgets/list/parsers/list_posts_parser';
import {parsePaginatedTableWidgetId} from 'src/components/backstage/widgets/paginated_table/parsers/paginated_table_posts_parser';
import {parseAccordionWidgetId} from 'src/components/backstage/widgets/accordion/parsers/accordion_posts_parser';

import {getDefaultWidgetByName, withTokensLengthCheck} from './parser';
import NoMoreTokensError from './errors/noMoreTokensError';
import ParseError from './errors/parseError';

// TODO: Add support for the issues' elements default section
export const parseTokensToHyperlinkReference = async (
    tokens: string[],
    options?: ParseOptions,
): Promise<HyperlinkReference | null> => {
    let hyperlinkReference: HyperlinkReference = {};
    try {
        hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseOrganization);
        if (!isSectionByName(tokens[0])) {
            hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseWidgetHash, options);
            return hyperlinkReference;
        }
        hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseSection);
        hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseObject);
        hyperlinkReference = await withTokensLengthCheck(hyperlinkReference, tokens, parseWidgetHash, options);
    } catch (error: any) {
        if (error instanceof NoMoreTokensError) {
            return hyperlinkReference;
        }
        return hyperlinkReference.organization ? hyperlinkReference : null;
    }
    return hyperlinkReference;
};

const parseOrganization = async (
    hyperlinkReference: HyperlinkReference,
    tokens: string[],
): Promise<HyperlinkReference> => {
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
const parseSection = async (
    hyperlinkReference: HyperlinkReference,
    tokens: string[],
): Promise<HyperlinkReference> => {
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

const parseObject = async (
    hyperlinkReference: HyperlinkReference,
    tokens: string[],
): Promise<HyperlinkReference> => {
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

export const parseWidgetHash = async (
    hyperlinkReference: HyperlinkReference,
    tokens: string[],
    options?: ParseOptions,
): Promise<HyperlinkReference> => {
    let isIssues = false;
    const widgetName = getAndRemoveOneFromArray(tokens, 0);
    if (!widgetName) {
        return hyperlinkReference;
    }
    let widget = hyperlinkReference.section?.widgets.filter(({name}) => name === widgetName)[0];
    if (!widget && hyperlinkReference.organization?.isEcosystem) {
        // If the section is not found, check whether it is a reference to a issue's widget
        widget = getDefaultWidgetByName(hyperlinkReference?.section, widgetName, options?.isRhsReference);
        isIssues = true;
    }
    if (!widget) {
        // If the section is not found, check whether it is a reference to a object's widget
        widget = hyperlinkReference.organization?.widgets.filter(({name}) => name === widgetName)[0];
        if (!widget) {
            return hyperlinkReference;
        }
    }
    const {widgetHash, objectForward} = await parseWidgetHashByType(hyperlinkReference, tokens, widget, {...options, isIssues});
    if (objectForward) {
        return {...hyperlinkReference, object: objectForward};
    }
    if (isAnyPropertyMissingFromObject(widgetHash)) {
        return hyperlinkReference;
    }
    return {...hyperlinkReference, widgetHash};
};

const parseWidgetHashByType = async (
    hyperlinkReference: HyperlinkReference,
    tokens: string[],
    widget: Widget,
    options?: ParseOptions,
): Promise<WidgetHashOrObjectForward> => {
    let widgetHash: WidgetHash | undefined;
    switch (widget.type) {
    case WidgetType.Accordion:
        return parseAccordionWidgetId(hyperlinkReference, tokens, widget, options);
    case WidgetType.Graph:
        widgetHash = await parseGraphWidgetId(hyperlinkReference, tokens, widget);
        return {widgetHash};
    case WidgetType.PaginatedTable:
        widgetHash = await parsePaginatedTableWidgetId(hyperlinkReference, tokens, widget, options);
        return {widgetHash};
    case WidgetType.List:
        widgetHash = await parseListWidgetId(hyperlinkReference, tokens, widget, options);
        return {widgetHash};
    case WidgetType.Table:
        widgetHash = await parseTableWidgetId(hyperlinkReference, tokens, widget);
        return {widgetHash};
    case WidgetType.TextBox:
        widgetHash = await parseTextBoxWidgetId(hyperlinkReference, widget, options);
        return {widgetHash};
    case WidgetType.Timeline:
        return {widgetHash};
    default:
        return {widgetHash};
    }
};
