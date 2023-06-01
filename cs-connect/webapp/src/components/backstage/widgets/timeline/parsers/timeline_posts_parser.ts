import {fetchTimelineData} from 'src/clients';
import {formatName, formatUrlWithId} from 'src/helpers';
import {Object, Widget} from 'src/types/organization';
import {HyperlinkReference, WidgetHash} from 'src/types/parser';

// TimelineReference example: #events-d5454bed-4e1a-4f5b-b71c-2993e157ba6f-5-widget
// TimelineItemReference example: #timeline-item-2ea54075-da38-44cf-afb9-cbe31a3d9513
export const parseTimelineWidgetId = async (
    {section, object}: HyperlinkReference,
    tokens: string[],
    widget: Widget,
): Promise<WidgetHash> => {
    const {name} = widget;
    const timelineWidgetHash = {
        hash: `${formatName(name as string)}-${object?.id}-${section?.id}-widget`,
        text: name as string,
    };
    const isReferenceToTimeline = tokens.length < 1;
    if (isReferenceToTimeline) {
        return timelineWidgetHash;
    }
    const widgetHash = await parseWidgetId(tokens, widget, object);
    if (!widgetHash) {
        return timelineWidgetHash;
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
    const data = await fetchTimelineData(widgetUrl);
    if (!data) {
        return null;
    }
    const item = data.items.find(({label, text}) => label === itemContent || text === itemContent);
    if (!item) {
        return null;
    }
    return {
        hash: `timeline-item-${item.id}`,
        text: item.text, // maybe here you can develop a way to identify if you need to use label or text
    };
};
