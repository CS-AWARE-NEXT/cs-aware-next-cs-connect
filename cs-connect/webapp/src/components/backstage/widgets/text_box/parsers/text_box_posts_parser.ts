import {fetchSectionInfo, fetchTextBoxData} from 'src/clients';
import {ecosystemObjectivesWidget} from 'src/constants';
import {formatName, formatPropertyName, formatUrlWithId} from 'src/helpers';
import {Object, Section, Widget} from 'src/types/organization';
import {HyperlinkReference, ParseOptions, WidgetHash} from 'src/types/parser';

// Reference example: #description-2ce53d5c-4bd4-4f02-89cc-d5b8f551770c-3-widget
export const parseTextBoxWidgetId = async (
    {section, object}: HyperlinkReference,
    widget: Widget,
    options?: ParseOptions,
): Promise<WidgetHash> => {
    const {name} = widget;
    const textBoxWidgetHash = {
        hash: `${formatName(name as string)}-${object?.id}-${section?.id}-widget`,
        text: name as string,
    };
    const isValueNeeded = options?.isValueNeeded || false;
    if (!isValueNeeded) {
        return textBoxWidgetHash;
    }
    if (options?.isIssues) {
        const issuesWidgetHash = await parseIssuesWidgetId(name as string, section, object);
        if (!issuesWidgetHash) {
            return textBoxWidgetHash;
        }
        return issuesWidgetHash;
    }
    const widgetHash = parseWidgetId(widget, section, object);
    if (!widgetHash) {
        return textBoxWidgetHash;
    }
    return widgetHash;
};

const parseWidgetId = async (
    {name, url}: Widget,
    section: Section | undefined,
    object: Object | undefined,
): Promise<WidgetHash> => {
    let widgetUrl = url as string;
    if (object) {
        widgetUrl = formatUrlWithId(widgetUrl, object.id);
    }
    const {text} = await fetchTextBoxData(widgetUrl);
    return {
        hash: `${formatName(name as string)}-${object?.id}-${section?.id}-widget`,
        text: name as string,
        value: text,
    };
};

const parseIssuesWidgetId = async (
    widgetName: string,
    section: Section | undefined,
    object: Object | undefined,
): Promise<WidgetHash | null> => {
    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return null;
    }
    return {
        hash: `${formatName(widgetName)}-${object?.id}-${section?.id}-widget`,
        text: widgetName,
        value: sectionInfo[formatPropertyName(ecosystemObjectivesWidget)],
    };
};