import {fetchTimelineData} from 'src/clients';
import {formatUrlWithId, getAndRemoveOneFromArray, getWidgetTokens} from 'src/helpers';
import {Widget} from 'src/types/organization';
import {HyperlinkSuggestion, ParseOptions, SuggestionsData} from 'src/types/parser';
import {TimelineData} from 'src/types/timeline';

const MAX_NUMBER_OF_TOKENS = 1;

const emptySuggestions = {suggestions: []};

export const parseTimelineWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    if (getWidgetTokens(options?.clonedTokens, widget).length >= MAX_NUMBER_OF_TOKENS) {
        return emptySuggestions;
    }
    return parseWidgetSuggestions(hyperlinkSuggestion, widget);
};

export const parseTimelineWidgetSuggestionsWithHint = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
    widget: Widget,
): Promise<SuggestionsData> => {
    if (tokens.length < 1 || tokens.length > MAX_NUMBER_OF_TOKENS) {
        return emptySuggestions;
    }
    const itemContent = getAndRemoveOneFromArray(tokens, 0);
    if (!itemContent) {
        return emptySuggestions;
    }
    return parseWidgetSuggestionsWithHint(
        hyperlinkSuggestion,
        widget,
        itemContent,
    );
};

const parseWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
): Promise<SuggestionsData> => {
    const data = await getTimelineData(hyperlinkSuggestion, widget);
    if (!data) {
        return emptySuggestions;
    }
    const labelSuggestions = data.items.
        map(({id, label}) => ({
            id: `${id}_text`,
            text: label,
        }));
    const textSuggestions = data.items.
        map(({id, text}) => ({
            id: `${id}_label`,
            text,
        }));
    return {suggestions: [...labelSuggestions, ...textSuggestions]};
};

const parseWidgetSuggestionsWithHint = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
    itemContent: string,
): Promise<SuggestionsData> => {
    const data = await getTimelineData(hyperlinkSuggestion, widget);
    if (!data) {
        return emptySuggestions;
    }
    const labelSuggestions = data.items.
        filter(({label}) => label.includes(itemContent)).
        map(({id, label}) => ({
            id: `${id}_label`,
            text: label,
        }));
    const textSuggestions = data.items.
        filter(({text}) => text.includes(itemContent)).
        map(({id, text}) => ({
            id: `${id}_text`,
            text,
        }));
    return {suggestions: [...labelSuggestions, ...textSuggestions]};
};

const getTimelineData = async (
    {object}: HyperlinkSuggestion,
    {url}: Widget,
): Promise<TimelineData | null> => {
    let widgetUrl = url as string;
    if (object) {
        widgetUrl = formatUrlWithId(widgetUrl, object.id);
    }
    const data = await fetchTimelineData(widgetUrl);
    if (!data) {
        return null;
    }
    return data;
};