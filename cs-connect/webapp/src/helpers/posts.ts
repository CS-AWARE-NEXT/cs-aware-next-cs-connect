import {Post} from 'mattermost-webapp/packages/types/src/posts';

import {getSiteUrl} from 'src/clients';
import {getPattern} from 'src/config/config';
import {
    DEFAULT_PATH,
    ORGANIZATIONS_PATH,
    PARENT_ID_PARAM,
    UNKNOWN,
} from 'src/constants';
import {HyperlinkReference, ParseOptions} from 'src/types/parser';
import {Organization} from 'src/types/organization';

import {
    extractReferenceFromMatch,
    formatName,
    parseMatchToTokens,
    parseOptionsForMatch,
    parseRhsReference,
    parseTokensToHyperlinkReference,
} from 'src/helpers';

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
        const options = parseOptionsForMatch(match);
        console.log('options', {options});

        // TODO: if the patterns ends with ) and the user types between the (), the suggested text may not be considered by Mattermost
        // E.g. the user types hood(), then they type hood(Org) and press on the Organization X suggestion.
        // At this point in the textarea appears hood(Organization X) but if the users press Enter before typing anything,
        // Mattermost sends hood(Org) as a message.
        // This may be deu to the fact that there is another textare other than the one we are using,
        // you can see this in the browser's console by inspecting the textare with id post_textbox and find the textarea with id post_textbox-reference
        const hyperlink = await buildHyperlinkFromMatch(options.parseMatch as string, options);
        map.set(options.match as string, hyperlink);
    }
    return map;
};

const buildHyperlinkFromMatch = async (match: string, options: ParseOptions): Promise<string> => {
    const tokensFromMatch = parseMatchToTokens(match);
    const [tokens, isRhsReference] = await parseRhsReference(tokensFromMatch);
    const hyperlinkReference = await parseTokensToHyperlinkReference(tokens, {...options, isRhsReference});
    if (!hyperlinkReference) {
        return match;
    }

    // console.log('Hyperlink reference: ' + JSON.stringify(hyperlinkReference, null, 2));
    return buildHyperlinkFromReference(hyperlinkReference, isRhsReference, match);
};

// [${text}](${siteUrl}/${teamName}/channels/${channelName}#${hash})
// [${text}](${siteUrl}/${defaultPath}/${organizationsPath}/${organizationId}/${sectionName}/${objectId}?parentId=${sectionId})
const buildHyperlinkFromReference = (
    hyperlinkReference: HyperlinkReference,
    isRhsReferemce: boolean,
    match: string,
): string => {
    // TODO: check whether it may be a good idea to find the tokens for the fallback,
    // in case the user provides a wrong reference and the algoritms has to fallback to a previous element.
    // For example, if they reference a non existing column in a table and the algorithm reference the table widget
    const reference = extractReferenceFromMatch(match) || UNKNOWN;
    if (isRhsReferemce) {
        return buildHyperlinkFromRhsReference(hyperlinkReference, reference);
    }
    return buildHyperlinkFromObjectPageReference(hyperlinkReference, reference);
};

const buildHyperlinkFromRhsReference = (
    hyperlinkReference: HyperlinkReference,
    reference: string,
): string => {
    const teamName = localStorage.getItem('teamName');
    const channelName = localStorage.getItem('channelName');
    const {object, widgetHash} = hyperlinkReference;
    let hyperlink = `${getSiteUrl()}/${teamName}/channels/${channelName}#`;
    if (!widgetHash) {
        hyperlink = `${hyperlink}_${object.id}`;
        return convertHyperlinkToMarkdown(hyperlink, reference);
    }
    hyperlink = `${hyperlink}${widgetHash.hash}`;
    return convertHyperlinkToMarkdown(hyperlink, widgetHash.value || reference);
};

const buildHyperlinkFromObjectPageReference = (
    hyperlinkReference: HyperlinkReference,
    reference: string,
): string => {
    const {organization, section, object, widgetHash} = hyperlinkReference;
    let hyperlink = `${getSiteUrl()}/${DEFAULT_PATH}/${ORGANIZATIONS_PATH}`;
    hyperlink = `${hyperlink}/${organization?.id}`;
    if (!section) {
        if (!widgetHash) {
            return convertHyperlinkToMarkdown(hyperlink, (organization as Organization).name);
        }
        hyperlink = `${hyperlink}#${widgetHash.hash}`;
        return convertHyperlinkToMarkdown(hyperlink, widgetHash.value || reference);
    }
    hyperlink = `${hyperlink}/${formatName(section.name)}`;
    if (!object) {
        return convertHyperlinkToMarkdown(hyperlink, reference);
    }

    // TODO: check if the sectionId is needed too
    hyperlink = `${hyperlink}/${object.id}?${PARENT_ID_PARAM}=${section.id}`;
    if (!widgetHash) {
        return convertHyperlinkToMarkdown(hyperlink, reference);
    }
    hyperlink = `${hyperlink}#${widgetHash.hash}`;
    return convertHyperlinkToMarkdown(hyperlink, widgetHash.value || reference);
};

const convertHyperlinkToMarkdown = (hyperlink: string, text: string): string => {
    return `[${text}](${hyperlink})`;
};

const buildHyperlinkedMessage = (message: string, hyperlinksMap: Map<string, string>): string => {
    return message.replace(getPattern(), (match) => {
        const hyperlink = hyperlinksMap.get(match);
        return hyperlink === undefined ? match : hyperlink;
    });

    // console.log('hyperlinksMap', {hyperlinksMap});
    // let hyperlinkedMessage = message;
    // hyperlinksMap.forEach((value, key) => {
    //     hyperlinkedMessage = hyperlinkedMessage.replaceAll(key, value);
    // });
    // return hyperlinkedMessage;
};