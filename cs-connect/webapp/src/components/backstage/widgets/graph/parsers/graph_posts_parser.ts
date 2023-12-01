import {fetchGraphData} from 'src/clients';
import {formatName, formatUrlWithId} from 'src/helpers';
import {Widget} from 'src/types/organization';
import {HyperlinkReference, WidgetHash} from 'src/types/parser';

import {NODE_INFO_SECTIONS} from './graph_suggestions_parser';

const DESCRIPTION_ID_PREFIX = 'graph-';

type GraphTriple = {
    id: string,
    isDescription: boolean;
    text: string,
};

// GrapheReference example: #system-2ce53d5c-4bd4-4f02-89cc-d5b8f551770c-3-widget
// GraphDescription reference: #description-2ce53d5c-4bd4-4f02-89cc-d5b8f551770c-3-widget
// NodeReference example: #server-1-2ce53d5c-4bd4-4f02-89cc-d5b8f551770c-3
export const parseGraphWidgetId = async (
    {section, object}: HyperlinkReference,
    tokens: string[],
    {name, url}: Widget,
): Promise<WidgetHash> => {
    const graphWidgetHash = {
        hash: `${formatName(name as string)}-${object?.id}-${section?.id}-widget`,
        text: name as string,
    };
    const isReferenceToGraph = tokens.length < 1;
    if (isReferenceToGraph) {
        return graphWidgetHash;
    }

    let widgetUrl = url as string;
    if (object) {
        widgetUrl = formatUrlWithId(widgetUrl, object.id);
    }
    const graphTriple = await parseGraphPair(tokens, widgetUrl);
    if (!graphTriple) {
        return graphWidgetHash;
    }
    const {id, isDescription, text} = graphTriple as GraphTriple;

    // Referencing a node info section
    if (tokens.length === 1) {
        const selectedSectionLabel = tokens[0];
        const selectedSection = NODE_INFO_SECTIONS.find((sectionInfo) => sectionInfo.label === selectedSectionLabel);
        if (!selectedSection) {
            return graphWidgetHash;
        }
        const hash = selectedSection.idCallback(id, section?.id || '', object?.id || '');
        return {hash, text: selectedSection.label};
    }

    // Referencing a node or the graph description
    let hash = `${id}-${object?.id}-${section?.id}`;
    hash = isDescription ? `${DESCRIPTION_ID_PREFIX}${hash}-widget` : hash;
    return {hash, text};
};

const parseGraphPair = async (tokens: string[], url: string): Promise<GraphTriple | null> => {
    const descriptionOrNodeName = tokens.splice(0, 1)[0];
    const data = await fetchGraphData(url);
    if (!data) {
        return null;
    }
    const {description, nodes} = data;
    if (description && description.name === descriptionOrNodeName) {
        return {
            id: formatName(description.name),
            isDescription: true,
            text: description.name,
        };
    }
    const node = nodes.find((n) => n.data.label === descriptionOrNodeName);
    return node ? {
        id: node.id,
        isDescription: false,
        text: node.data.label,
    } : null;
};
