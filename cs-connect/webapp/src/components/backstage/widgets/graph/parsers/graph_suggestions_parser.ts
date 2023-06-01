import {fetchGraphData} from 'src/clients';
import {formatUrlWithId, getAndRemoveOneFromArray, getWidgetTokens} from 'src/helpers';
import {GraphData} from 'src/types/graph';
import {Widget} from 'src/types/organization';
import {HyperlinkSuggestion, ParseOptions, SuggestionsData} from 'src/types/parser';

const MAX_NUMBER_OF_TOKENS = 1;

const emptySuggestions = {suggestions: []};

export const parseGraphWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    if (getWidgetTokens(options?.clonedTokens, widget).length >= MAX_NUMBER_OF_TOKENS) {
        return emptySuggestions;
    }

    const data = await getGraphData(hyperlinkSuggestion, widget);
    if (!data) {
        return emptySuggestions;
    }
    const {description, nodes} = data;
    let suggestions = nodes.
        map((node) => ({
            id: node.id,
            text: node.data.label,
        }));
    if (description) {
        suggestions = [...suggestions, {
            id: description.name,
            text: description.name,
        }];
    }
    return {suggestions};
};

export const parseGraphWidgetSuggestionsWithHint = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
    widget: Widget,
): Promise<SuggestionsData> => {
    if (tokens.length < 1 || tokens.length > MAX_NUMBER_OF_TOKENS) {
        return emptySuggestions;
    }
    const data = await getGraphData(hyperlinkSuggestion, widget);
    if (!data) {
        return emptySuggestions;
    }
    const descriptionOrNodeName = getAndRemoveOneFromArray(tokens, 0);
    if (!descriptionOrNodeName) {
        return emptySuggestions;
    }
    const {description, nodes} = data;
    let suggestions = nodes.
        filter((node) => node.data.label.includes(descriptionOrNodeName)).
        map((node) => ({
            id: node.id,
            text: node.data.label,
        }));
    if (description && description.name.includes(descriptionOrNodeName)) {
        suggestions = [...suggestions, {
            id: description.name,
            text: description.name,
        }];
    }
    return {suggestions};
};

const getGraphData = async (
    {object}: HyperlinkSuggestion,
    {url}: Widget,
): Promise<GraphData | null> => {
    let widgetUrl = url as string;
    if (object) {
        widgetUrl = formatUrlWithId(widgetUrl, object.id);
    }
    const data = await fetchGraphData(widgetUrl);
    if (!data) {
        return null;
    }
    return data;
};