
import {fetchGraphData} from 'src/clients';
import {formatUrlWithId, getAndRemoveOneFromArray, getWidgetTokens} from 'src/helpers';
import {GraphData} from 'src/types/graph';
import {Widget} from 'src/types/organization';
import {HyperlinkSuggestion, ParseOptions, SuggestionsData} from 'src/types/parser';

import {NODE_INFO_ID_PREFIX} from 'src/components/backstage/widgets/graph/graph_node_info';

// We can either reference a node or at most one of its info sections
const MAX_NUMBER_OF_TOKENS = 2;

// Array of info on how to properly parse node info sections. New sections need to be added in here as an entry to properly show as suggestions.
export const NODE_INFO_SECTIONS = [
    {
        label: 'Description',
        idCallback: (nodeId: string, sectionId: string, parentId: string) => `${nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-widget`,
    },
];

const emptySuggestions = {suggestions: []};

// Called when the user is creating a hyperlink and starts looking for elements of the graph to hyperlink (without filtering based on partial text inputs).
// All the valid suggestions related to this graph should be displayed, with the layer chosen based on the number of tokens reached so far.
export const parseGraphWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    const widgetTokens = getWidgetTokens(options?.clonedTokens, widget);

    if (widgetTokens.length >= MAX_NUMBER_OF_TOKENS) {
        return emptySuggestions;
    }

    const data = await getGraphData(hyperlinkSuggestion, widget);
    if (!data) {
        return emptySuggestions;
    }
    const {description, nodes} = data;

    if (widgetTokens.length > 0) {
        const selectedNodeSuggestion = hyperlinkSuggestion.suggestions.suggestions[0] || undefined;
        if (selectedNodeSuggestion) {
            const selectedNode = nodes.find((node) => node.id === selectedNodeSuggestion.id);
            if (!selectedNode) {
                return emptySuggestions;
            }
            const suggestions = NODE_INFO_SECTIONS.map((sectionInfo) => {
                return {
                    text: sectionInfo.label,
                    id: sectionInfo.idCallback(selectedNode.id, selectedNode.data.sectionId, selectedNode.data.parentId),
                };
            });
            return {suggestions};
        }
    }
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

// Called when the user inputs some text while creating a hyperlink. We filter the valid suggestions based on the text the user has written so far
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

    const {description, nodes} = data;
    if (tokens.length === 1) {
        const descriptionOrNodeName = getAndRemoveOneFromArray(tokens, 0);
        if (!descriptionOrNodeName) {
            return emptySuggestions;
        }
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
    }
    const [nodeName, sectionSubstring] = [tokens[0], tokens[1]];
    if (!nodeName || !sectionSubstring) {
        return emptySuggestions;
    }
    const targetNode = nodes.find((node) => node.data.label.includes(nodeName));
    if (!targetNode) {
        return emptySuggestions;
    }

    let suggestions: {id: string, text: string}[] = [];
    NODE_INFO_SECTIONS.forEach((sectionInfo) => {
        if (sectionInfo.label.includes(sectionSubstring)) {
            suggestions = [...suggestions, {
                id: sectionInfo.idCallback(targetNode.id, targetNode.data.sectionId, targetNode.data.parentId),
                text: sectionInfo.label,
            }];
        }
    });

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
