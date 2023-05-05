import {CommandArgs} from 'mattermost-webapp/packages/types/src/integrations';
import {Post} from 'mattermost-webapp/packages/types/src/posts';

import {getSiteUrl} from 'src/clients';
import {getPattern} from 'src/config/config';
import {DEFAULT_PATH, ORGANIZATIONS_PATH, PARENT_ID_PARAM} from 'src/constants';
import {HyperlinkReference} from 'src/types/parser';
import {
    Object,
    Organization,
    Section,
    Widget,
} from 'src/types/organization';

import {parseMatchToTokens, parseTokensToHyperlinkReference} from './parser';

export const slashCommandWillBePosted = async (message: string, args: CommandArgs) => {
    return {message, args};
};

export const messageWillBePosted = async (post: Post) => {
    if (!isMessageToHyperlink(post)) {
        return {post};
    }
    const hyperlinkedPost = await hyperlinkPost(post);
    return {post: hyperlinkedPost};
};

const isMessageToHyperlink = ({message}: Post): boolean => {
    return getPattern().test(message);
};

const hyperlinkPost = async (post: Post): Promise<Post> => {
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

    // alert('tokens: ' + JSON.stringify(tokens, null, 2));
    const hyperlinkReference = await parseTokensToHyperlinkReference(tokens);
    if (!hyperlinkReference) {
        return match;
    }
    alert('widget: ' + JSON.stringify(hyperlinkReference.widget, null, 2));
    alert('hash: ' + JSON.stringify(hyperlinkReference.widgetHash, null, 2));
    return buildHyperlinkFromReference(hyperlinkReference);
};

// `[${object.name}](${getSiteUrl()}/${DEFAULT_PATH}/${ORGANIZATIONS_PATH}/${organization.id}/${section.name}/${object.id}?parentId=${section.id})`;
const buildHyperlinkFromReference = (hyperlinkReference: HyperlinkReference): string => {
    const {organization, section, object, widget, widgetHash} = hyperlinkReference;
    let hyperlink = `${getSiteUrl()}/${DEFAULT_PATH}/${ORGANIZATIONS_PATH}`;
    hyperlink = `${hyperlink}/${organization?.id}`;
    if (!section) {
        return convertHyperlinkToMarkdown(hyperlink, (organization as Organization).name);
    }
    hyperlink = `${hyperlink}/${section.name}`;
    if (!object) {
        return convertHyperlinkToMarkdown(hyperlink, (section as Section).name);
    }

    // TODO: check if the sectionId is needed too
    hyperlink = `${hyperlink}/${object.id}?${PARENT_ID_PARAM}=${section.id}`;
    if (!widget || widgetHash === '') {
        return convertHyperlinkToMarkdown(hyperlink, (object as Object).name);
    }
    hyperlink = `${hyperlink}#${widgetHash}`;
    return convertHyperlinkToMarkdown(hyperlink, (widget as Widget).name as string);
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