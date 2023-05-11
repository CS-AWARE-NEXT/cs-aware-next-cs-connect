import {Post} from 'mattermost-webapp/packages/types/src/posts';

import {getSiteUrl} from 'src/clients';
import {getPattern} from 'src/config/config';
import {DEFAULT_PATH, ORGANIZATIONS_PATH, PARENT_ID_PARAM} from 'src/constants';
import {HyperlinkReference} from 'src/types/parser';
import {Organization} from 'src/types/organization';

import {parseMatchToTokens, parseTokensToHyperlinkReference} from 'src/helpers';

export const isMessageToHyperlink = ({message}: Post): boolean => {
    return getPattern().test(message);
};

export const hyperlinkPost = async (post: Post): Promise<Post> => {
    const {message} = post;
    const map = await buildHyperlinksMap(message);
    if (map === null) {
        return post;
    }
    return {...post, message: buildHyperlinkedMessage(message, map)};
};

const buildHyperlinksMap = async (message: string): Promise<Map<string, string> | null> => {
    const map = new Map();
    const matches = message.match(getPattern());
    if (matches === null) {
        return null;
    }
    for (const match of matches) {
        const hyperlink = await buildHyperlinkFromMatch(match);
        map.set(match, hyperlink);
    }
    return map;
};

const buildHyperlinkFromMatch = async (match: string): Promise<string> => {
    const tokens = parseMatchToTokens(match);
    const hyperlinkReference = await parseTokensToHyperlinkReference(tokens);
    if (!hyperlinkReference) {
        return match;
    }
    console.log('Hyperlink reference: ' + JSON.stringify(hyperlinkReference, null, 2));
    return buildHyperlinkFromReference(hyperlinkReference);
};

// `[${text}](${siteUrl}/${defaultPath}/${organizationsPath}/${organizationId}/${sectionName}/${objectId}?parentId=${sectionId})`;
const buildHyperlinkFromReference = (hyperlinkReference: HyperlinkReference): string => {
    const {organization, section, object, widgetHash} = hyperlinkReference;
    let hyperlink = `${getSiteUrl()}/${DEFAULT_PATH}/${ORGANIZATIONS_PATH}`;
    hyperlink = `${hyperlink}/${organization?.id}`;
    if (!section) {
        if (!widgetHash) {
            return convertHyperlinkToMarkdown(hyperlink, (organization as Organization).name);
        }
        hyperlink = `${hyperlink}#${widgetHash.hash}`;
        return convertHyperlinkToMarkdown(hyperlink, widgetHash.text);
    }
    hyperlink = `${hyperlink}/${section.name}`;
    if (!object) {
        return convertHyperlinkToMarkdown(hyperlink, section.name);
    }

    // TODO: check if the sectionId is needed too
    hyperlink = `${hyperlink}/${object.id}?${PARENT_ID_PARAM}=${section.id}`;
    if (!widgetHash) {
        return convertHyperlinkToMarkdown(hyperlink, object.name);
    }
    hyperlink = `${hyperlink}#${widgetHash.hash}`;
    return convertHyperlinkToMarkdown(hyperlink, widgetHash.text);
};

const convertHyperlinkToMarkdown = (hyperlink: string, text: string): string => {
    return `[${text}](${hyperlink})`;
};

const buildHyperlinkedMessage = (message: string, hyperlinksMap: Map<string, string>): string => {
    return message.replace(getPattern(), (match) => {
        const hyperlink = hyperlinksMap.get(match);
        return hyperlink === undefined ? match : hyperlink;
    });
};