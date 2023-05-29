import {
    END_SYMBOL,
    START_SYMBOL,
    getOrganizationBySectionId,
    getStartSymbol,
    getSymbol,
} from 'src/config/config';
import {fetchChannelById, fetchSectionInfo} from 'src/clients';
import {getSection} from 'src/hooks';
import {Section, SectionInfo, Widget} from 'src/types/organization';
import {WidgetType} from 'src/components/backstage/widgets/widget_types';
import {
    OBJECT_ID_TOKEN,
    TOKEN_SEPARATOR,
    UNKNOWN,
    ecosystemAttachmentsWidget,
    ecosystemElementsWidget,
    ecosystemObjectivesWidget,
    ecosystemOutcomesWidget,
    ecosystemRolesWidget,
} from 'src/constants';
import {formatStringToCapitalize, formatStringToLowerCase} from 'src/helpers';
import {ParseOptions} from 'src/types/parser';

import NoMoreTokensError from './errors/noMoreTokensError';

// TODO: study how to add support for ecosystem
export const parseRhsReference = async (tokens: string[])
: Promise<[
    string[],
    boolean,
    SectionInfo | undefined,
]> => {
    const channelId = localStorage.getItem('channelId');
    const {channel} = await fetchChannelById(channelId as string);

    const {id, name: sectionName, url} = getSection(channel.parentId);
    const {name: organizationName} = getOrganizationBySectionId(id);
    const object = await fetchSectionInfo(channel.sectionId, url);
    const {name: objectName} = object;

    const referenceToken = tokens[0];
    const isRhsReference = referenceToken === objectName;
    if (isRhsReference) {
        return [
            [organizationName, sectionName, ...tokens],
            isRhsReference,
            undefined,
        ];
    }
    const isPartialRhsReference = objectName.includes(referenceToken);
    return [
        tokens,
        isRhsReference,
        isPartialRhsReference ? object : undefined,
    ];
};

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

export const parseMatchToTokens = (match: string): string[] => {
    const reference = extractReferenceFromMatch(match);
    if (!reference) {
        return [];
    }
    const tokens = reference.split(TOKEN_SEPARATOR);
    return tokens.filter((token) => token !== '');
};

// TODO: define options enum
export const parseOptionsForMatch = (match: string): ParseOptions => {
    const options: ParseOptions = {match, parseMatch: match};
    const matchTokens = match.split(END_SYMBOL).filter((token) => token !== '');
    if (matchTokens.length < 2) {
        return options;
    }
    const option = matchTokens[matchTokens.length - 1];
    if (option.startsWith('.value')) {
        return {
            ...options,
            isValueNeeded: true,
            valueReference: option,
            parseMatch: `${matchTokens[0]}${END_SYMBOL}`,
        };
    }
    return options;
};

export const parseMatchToReference = (match: string): string => {
    let reference = extractReferenceFromMatch(match) || UNKNOWN;
    if (reference.endsWith(TOKEN_SEPARATOR)) {
        reference = reference.substring(0, reference.lastIndexOf(TOKEN_SEPARATOR));
    }
    return reference;
};

export const extractReferenceFromMatch = (match: string): string | null => {
    if (match === `${getSymbol()}${START_SYMBOL}${END_SYMBOL}`) {
        return null;
    }
    if (!match.endsWith(END_SYMBOL)) {
        return match.substring(getSymbol().length + 1);
    }
    return match.substring(getSymbol().length + 1, match.length - 1);
};

export const withTokensLengthCheck = async <T>(
    obj: T,
    tokens: string[],
    parse: (obj: T, tokens: string[], options?: ParseOptions) => Promise<T>,
    options?: ParseOptions,
): Promise<T> => {
    if (tokens.length < 1) {
        throw new NoMoreTokensError('No more tokens to parse');
    }
    return parse(obj, tokens, options);
};

export const getDefaultsWidgets = (
    section: Section | undefined,
    isRhsReference?: boolean,
): Widget[] => {
    const isRhs = isRhsReference || false;
    const url = `${section?.url}/${OBJECT_ID_TOKEN}`;
    const objectivesWidget = {
        name: formatStringToCapitalize(ecosystemObjectivesWidget),
        type: WidgetType.TextBox,
        url,
    };
    const outcomesWidget = {
        name: formatStringToCapitalize(ecosystemOutcomesWidget),
        type: WidgetType.List,
        url,
    };
    const rolesWidget = {
        name: formatStringToCapitalize(ecosystemRolesWidget),
        type: WidgetType.PaginatedTable,
        url,
    };
    const elementsWidget = {
        name: formatStringToCapitalize(ecosystemElementsWidget),
        type: isRhs ? WidgetType.Accordion : WidgetType.PaginatedTable,
        url,
    };
    const attachmentsWidget = {
        name: formatStringToCapitalize(ecosystemAttachmentsWidget),
        type: WidgetType.List,
        url,
    };
    return [objectivesWidget, outcomesWidget, rolesWidget, elementsWidget, attachmentsWidget];
};

export const getDefaultWidgetByName = (
    section: Section | undefined,
    widgetName: string,
    isRhsReference?: boolean,
): Widget | undefined => {
    const isRhs = isRhsReference || false;
    const url = `${section?.url}/${OBJECT_ID_TOKEN}`;
    switch (formatStringToLowerCase(widgetName)) {
    case ecosystemObjectivesWidget:
        return {
            name: formatStringToCapitalize(ecosystemObjectivesWidget),
            type: WidgetType.TextBox,
            url,
        };
    case ecosystemOutcomesWidget:
        return {
            name: formatStringToCapitalize(ecosystemOutcomesWidget),
            type: WidgetType.List,
            url,
        };
    case ecosystemRolesWidget:
        return {
            name: formatStringToCapitalize(ecosystemRolesWidget),
            type: WidgetType.PaginatedTable,
            url,
        };
    case ecosystemElementsWidget:
        return {
            name: formatStringToCapitalize(ecosystemElementsWidget),
            type: isRhs ? WidgetType.Accordion : WidgetType.PaginatedTable,
            url,
        };
    case ecosystemAttachmentsWidget:
        return {
            name: formatStringToCapitalize(ecosystemAttachmentsWidget),
            type: WidgetType.List,
            url,
        };
    default:
        return undefined;
    }
};