import {fetchListData, fetchSectionInfo} from 'src/clients';
import {ecosystemAttachmentsWidget, ecosystemOutcomesWidget} from 'src/constants';
import {formatName, formatStringToLowerCase, formatUrlWithId} from 'src/helpers';
import {
    Object,
    Section,
    SectionInfo,
    Widget,
} from 'src/types/organization';
import {HyperlinkReference, ParseOptions, WidgetHash} from 'src/types/parser';
import {Attachment, Outcome} from 'src/types/scenario_wizard';

// ListReference example: #outcomes-23e6db73-68c5-4362-ae73-d7eed4dac16a-0-widget
// ListItemReference example: #list-item-470b4236-8261-4754-a780-b719caa7e525
export const parseListWidgetId = async (
    {section, object}: HyperlinkReference,
    tokens: string[],
    widget: Widget,
    options?: ParseOptions,
): Promise<WidgetHash> => {
    const {name} = widget;
    const listWidgetHash = {
        hash: `${formatName(name as string)}-${object?.id}-${section?.id}-widget`,
        text: name as string,
    };
    const isReferenceToList = tokens.length < 1;
    if (isReferenceToList) {
        return listWidgetHash;
    }
    if (options?.isIssues) {
        const issuesWidgetHash = await parseIssuesWidgetId(tokens, widget, section, object);
        if (!issuesWidgetHash) {
            return listWidgetHash;
        }
        return issuesWidgetHash;
    }
    const widgetHash = await parseWidgetId(tokens, widget, object);
    if (!widgetHash) {
        return listWidgetHash;
    }
    return widgetHash;
};

const parseWidgetId = async (
    tokens: string[],
    {url}: Widget,
    object: Object | undefined,
): Promise<WidgetHash | null> => {
    let widgetUrl = url as string;
    if (object) {
        widgetUrl = formatUrlWithId(widgetUrl, object.id);
    }
    const itemContent = tokens.splice(0, 1)[0];
    const data = await fetchListData(widgetUrl);
    if (!data) {
        return null;
    }
    const item = data.items.find(({text}) => text.startsWith(itemContent));
    if (!item) {
        return null;
    }
    return {
        hash: `list-item-${item.id}`,
        text: item.text,
    };
};

const parseIssuesWidgetId = async (
    tokens: string[],
    {name}: Widget,
    section: Section | undefined,
    object: Object | undefined,
): Promise<WidgetHash | null> => {
    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return null;
    }
    const itemContent = tokens.splice(0, 1)[0];
    const [item, text] = getItemAndText(sectionInfo, name as string, itemContent);
    if (!item) {
        return null;
    }
    return {
        hash: `list-item-${item.id}`,
        text,
    };
};

const getItemAndText = (
    sectionInfo: SectionInfo,
    widgetName: string,
    itemContent: string,
): [Outcome | Attachment | undefined, string] => {
    let item: Outcome | Attachment | undefined;
    let text = '';
    if (formatStringToLowerCase(widgetName) === ecosystemOutcomesWidget) {
        item = sectionInfo.outcomes.find(({outcome}: Outcome) => outcome.startsWith(itemContent));
        text = item ? (item as Outcome).outcome : text;
    }
    if (formatStringToLowerCase(widgetName) === ecosystemAttachmentsWidget) {
        item = sectionInfo.attachments.find(({attachment}: Attachment) => attachment.startsWith(itemContent));
        text = item ? (item as Attachment).attachment : text;
    }
    return [item, text];
};