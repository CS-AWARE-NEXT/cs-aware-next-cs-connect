import {formatName} from 'src/hooks';
import {Widget} from 'src/types/organization';
import {HyperlinkReference, WidgetHash} from 'src/types/parser';

// Reference example: #description-2ce53d5c-4bd4-4f02-89cc-d5b8f551770c-3-widget
export const buildTextBoxWidgetId = (
    {section, object}: HyperlinkReference,
    {name}: Widget,
): WidgetHash => {
    return {
        hash: `${formatName(name as string)}-${object.id}-${section?.id}-widget`,
        text: name as string,
    };
};