import {Post} from 'mattermost-webapp/packages/types/src/posts';

import {getSiteUrl} from 'src/clients';
import {getPattern} from 'src/config/config';
import {DEFAULT_PATH, ORGANIZATIONS_PATH, PARENT_ID_PARAM} from 'src/constants';
import {HyperlinkReference} from 'src/types/parser';
import {Organization} from 'src/types/organization';

import {parseMatchToTokens, parseRhsReference, parseTokensToHyperlinkReference} from 'src/helpers';

export const isMessageToHyperlink = ({message}: Post): boolean => {
    return getPattern().test(message);
};

export const hyperlinkPost = async (post: Post): Promise<Post> => {
    const {message} = post;
    const map = await buildHyperlinksMap(message);
    if (!map) {
        return post;
    }
    return {...post, message: buildHyperlinkedMessage(message, map)};
};

const buildHyperlinksMap = async (message: string): Promise<Map<string, string> | null> => {
    const map = new Map();
    const matches = message.match(getPattern());
    if (!matches) {
        return null;
    }
    for (const match of matches) {
        // TODO: if the patterns ends with ) and the user types between the (), the suggested text may not be considered by Mattermost
        // E.g. the user types hood(), then they type hood(Org) and press on the Organization X suggestion.
        // At this point in the textarea appears hood(Organization X) but if the users press Enter before typing anything,
        // Mattermost sends hood(Org) as a message.
        // This may be deu to the fact that there is another textare other than the one we are using,
        // you can see this in the browser's console by inspecting the textare with id post_textbox and find the textarea with id post_textbox-reference
        const hyperlink = await buildHyperlinkFromMatch(match);
        map.set(match, hyperlink);
    }
    return map;
};

const buildHyperlinkFromMatch = async (match: string): Promise<string> => {
    const tokensFromMatch = parseMatchToTokens(match);
    const [tokens, isRhsReference] = await parseRhsReference(tokensFromMatch);
    const hyperlinkReference = await parseTokensToHyperlinkReference(tokens);
    if (!hyperlinkReference) {
        return match;
    }

    // console.log('Hyperlink reference: ' + JSON.stringify(hyperlinkReference, null, 2));
    return buildHyperlinkFromReference(hyperlinkReference, isRhsReference);
};

// [${text}](${siteUrl}/${teamName}/channels/${channelName}#${hash})
// [${text}](${siteUrl}/${defaultPath}/${organizationsPath}/${organizationId}/${sectionName}/${objectId}?parentId=${sectionId})
const buildHyperlinkFromReference = (
    hyperlinkReference: HyperlinkReference,
    isRhsReferemce: boolean,
): string => {
    if (isRhsReferemce) {
        return buildHyperlinkFromRhsReference(hyperlinkReference);
    }
    return buildHyperlinkFromObjectPageReference(hyperlinkReference);
};

const buildHyperlinkFromRhsReference = (hyperlinkReference: HyperlinkReference): string => {
    const teamName = localStorage.getItem('teamName');
    const channelName = localStorage.getItem('channelName');
    const {object, widgetHash} = hyperlinkReference;
    let hyperlink = `${getSiteUrl()}/${teamName}/channels/${channelName}#`;
    if (!widgetHash) {
        hyperlink = `${hyperlink}_${object.id}`;
        return convertHyperlinkToMarkdown(hyperlink, object.name);
    }
    hyperlink = `${hyperlink}${widgetHash.hash}`;
    return convertHyperlinkToMarkdown(hyperlink, widgetHash.text);
};

const buildHyperlinkFromObjectPageReference = (hyperlinkReference: HyperlinkReference): string => {
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