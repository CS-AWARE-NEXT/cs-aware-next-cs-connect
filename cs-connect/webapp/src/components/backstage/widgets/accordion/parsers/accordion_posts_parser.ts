import {fetchSectionInfo} from 'src/clients';
import {getOrganizationById} from 'src/config/config';
import {
    formatName,
    formatUrlWithId,
    getAndRemoveOneFromArray,
    parseWidgetHash,
} from 'src/helpers';
import {getSection} from 'src/hooks';
import {
    Object,
    Section,
    SectionInfo,
    Widget,
} from 'src/types/organization';
import {HyperlinkReference, ParseOptions, WidgetHashOrObjectForward} from 'src/types/parser';
import {Element} from 'src/types/scenario_wizard';

export const parseAccordionWidgetId = async (
    {section, object}: HyperlinkReference,
    tokens: string[],
    widget: Widget,
    options?: ParseOptions,
): Promise<WidgetHashOrObjectForward> => {
    const {name} = widget;
    const accordionWidgetHash = {
        widgetHash: {
            hash: `${formatName(name as string)}-${object?.id}-${section?.id}-widget`,
            text: name as string,
        },
    };
    const isReferenceToAccordion = tokens.length < 1;
    if (isReferenceToAccordion) {
        return accordionWidgetHash;
    }
    if (options?.isIssues) {
        const issuesWidgetHash = await parseIssuesWidgetId(tokens, section, object, options);
        if (!issuesWidgetHash) {
            return accordionWidgetHash;
        }
        return issuesWidgetHash;
    }
    const widgetHash = await parseWidgetId(tokens, widget, object);
    if (!widgetHash) {
        return accordionWidgetHash;
    }
    return widgetHash;
};

// TODO: implement default widget parser
const parseWidgetId = async (
    tokens: string[],
    {url}: Widget,
    object: Object | undefined,
): Promise<WidgetHashOrObjectForward | null> => {
    let widgetUrl = url as string;
    if (object) {
        widgetUrl = formatUrlWithId(widgetUrl, object.id);
    }
    return null;
};

const parseIssuesWidgetId = async (
    tokens: string[],
    section: Section | undefined,
    object: Object | undefined,
    options?: ParseOptions,
): Promise<WidgetHashOrObjectForward | null | undefined> => {
    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return null;
    }
    const element = getElement(sectionInfo, tokens);
    if (!element) {
        return null;
    }
    const {id, name, organizationId, parentId} = element;
    const elementOrganization = getOrganizationById(organizationId);
    const elementSection = getSection(parentId);
    const elementObject = {id, name};

    const hyperlinkReference = await parseWidgetHash(
        {
            organization: elementOrganization,
            section: elementSection,
            object: elementObject,
        },
        tokens,
        buildOptions(options),
    );
    return {
        widgetHash: hyperlinkReference.widgetHash,
        objectForward: hyperlinkReference.widgetHash ? undefined : elementObject,
    };
};

export const getElement = (sectionInfo: SectionInfo, tokens: string[]): Element | null => {
    const elementName = getAndRemoveOneFromArray(tokens, 0);
    const element = sectionInfo.elements.find((e: Element) => e.name === elementName);
    if (!element) {
        return null;
    }
    return element as Element;
};

const buildOptions = (options?: ParseOptions): ParseOptions => {
    return {
        isValueNeeded: options?.isValueNeeded,
        valueReference: options?.valueReference,
    };
};