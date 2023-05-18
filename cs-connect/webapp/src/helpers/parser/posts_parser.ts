import {HyperlinkReference, WidgetHash} from 'src/types/parser';
import {formatStringToCapitalize, getAndRemoveOneFromArray, isAnyPropertyMissingFromObject} from 'src/helpers';
import {getOrganizationByName} from 'src/config/config';
import {fetchPaginatedTableData} from 'src/clients';
import {OBJECT_ID_TOKEN, ecosystemElementsWidget} from 'src/constants';
import {WidgetType} from 'src/components/backstage/widgets/widget_types';
import {parseTableWidgetId} from 'src/components/backstage/widgets/table/parsers/table_posts_parser';
import {parseTextBoxWidgetId} from 'src/components/backstage/widgets/text_box/parsers/text_box_posts_parser';
import {parseGraphWidgetId} from 'src/components/backstage/widgets/graph/parsers/graph_posts_parser';
import {Widget} from 'src/types/organization';
import {isSectionByName} from 'src/hooks';

import {withTokensLengthCheck} from './parser';
import NoMoreTokensError from './errors/noMoreTokensError';
import ParseError from './errors/parseError';

// TODO: Add support for the issues' elements default section
export const parseTokensToHyperlinkReference = async (
    tokens: string[],
): Promise<HyperlinkReference | null> => {
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

const parseWidgetHash = async (
    hyperlinkReference: HyperlinkReference,
    tokens: string[],
): Promise<HyperlinkReference> => {
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
        return parseGraphWidgetId(hyperlinkReference, tokens, widget);
    case WidgetType.PaginatedTable:
        return {hash: '', text: ''};
    case WidgetType.List:
        return {hash: '', text: ''};
    case WidgetType.Table:
        return parseTableWidgetId(hyperlinkReference, tokens, widget);
    case WidgetType.TextBox:
        return parseTextBoxWidgetId(hyperlinkReference, widget);
    case WidgetType.Timeline:
        return {hash: '', text: ''};
    default:
        return {hash: '', text: ''};
    }
};
