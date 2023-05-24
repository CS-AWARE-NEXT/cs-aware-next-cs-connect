import {fetchTextBoxData} from 'src/clients';
import {formatName, formatUrlWithId} from 'src/helpers';
import {Widget} from 'src/types/organization';
import {HyperlinkReference, ParseOptions, WidgetHash} from 'src/types/parser';

// Reference example: #description-2ce53d5c-4bd4-4f02-89cc-d5b8f551770c-3-widget
export const parseTextBoxWidgetId = async (
    {section, object}: HyperlinkReference,
    {name, url}: Widget,
    options?: ParseOptions,
): Promise<WidgetHash> => {
    const isValueNeeded = options?.isValueNeeded || false;
    if (!isValueNeeded) {
        return {
            hash: `${formatName(name as string)}-${object?.id}-${section?.id}-widget`,
            text: name as string,
        };
    }
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