import {fetchListData, fetchSectionInfo} from 'src/clients';
import {ecosystemAttachmentsWidget, ecosystemOutcomesWidget} from 'src/constants';
import {
    formatStringToLowerCase,
    formatUrlWithId,
    getAndRemoveOneFromArray,
    getWidgetTokens,
} from 'src/helpers';
import {ListData} from 'src/types/list';
import {Widget} from 'src/types/organization';
import {
    HyperlinkSuggestion,
    ParseOptions,
    SuggestionData,
    SuggestionsData,
} from 'src/types/parser';
import {Attachment, Outcome} from 'src/types/scenario_wizard';

const MAX_NUMBER_OF_TOKENS = 1;
const MAX_SUGGESTION_LENGTH = 94;

const emptySuggestions = {suggestions: []};

export const parseListWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    if (getWidgetTokens(options?.clonedTokens, widget).length >= MAX_NUMBER_OF_TOKENS) {
        return emptySuggestions;
    }
    if (options?.isIssues) {
        return parseIssuesWidgetSuggestions(hyperlinkSuggestion, widget);
    }
    return parseWidgetSuggestions(hyperlinkSuggestion, widget);
};

export const parseListWidgetSuggestionsWithHint = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[],
    widget: Widget,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    if (tokens.length < 1 || tokens.length > MAX_NUMBER_OF_TOKENS) {
        return emptySuggestions;
    }
    const itemContent = getAndRemoveOneFromArray(tokens, 0);
    if (!itemContent) {
        return emptySuggestions;
    }
    if (options?.isIssues) {
        return parseIssuesWidgetSuggestionsWithHint(
            hyperlinkSuggestion,
            widget,
            itemContent,
        );
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
    const data = await getListData(hyperlinkSuggestion, widget);
    if (!data) {
        return emptySuggestions;
    }
    const suggestions = data.items.
        map(({id, text}) => ({
            id,
            text: getEllipsedText(text),
        }));
    return {suggestions};
};

const parseIssuesWidgetSuggestions = async (
    {object, section}: HyperlinkSuggestion,
    {name}: Widget,
): Promise<SuggestionsData> => {
    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return emptySuggestions;
    }
    let suggestions: SuggestionData[] = [];
    if (formatStringToLowerCase(name as string) === ecosystemOutcomesWidget) {
        suggestions = sectionInfo.outcomes.
            map(({id, outcome}: Outcome) => ({
                id,
                text: getEllipsedText(outcome),
            }));
    }
    if (formatStringToLowerCase(name as string) === ecosystemAttachmentsWidget) {
        suggestions = sectionInfo.attachments.
            map(({id, attachment}: Attachment) => ({
                id,
                text: getEllipsedText(attachment),
            }));
    }
    return {suggestions};
};

const parseWidgetSuggestionsWithHint = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
    itemContent: string,
): Promise<SuggestionsData> => {
    const data = await getListData(hyperlinkSuggestion, widget);
    if (!data) {
        return emptySuggestions;
    }
    const suggestions = data.items.
        filter(({text}) => text.includes(itemContent)).
        map(({id, text}) => ({
            id,
            text: getEllipsedText(text),
        }));
    return {suggestions};
};

const parseIssuesWidgetSuggestionsWithHint = async (
    {object, section}: HyperlinkSuggestion,
    {name}: Widget,
    itemContent: string,
): Promise<SuggestionsData> => {
    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return emptySuggestions;
    }
    let suggestions: SuggestionData[] = [];
    if (formatStringToLowerCase(name as string) === ecosystemOutcomesWidget) {
        suggestions = sectionInfo.outcomes.
            filter(({outcome}: Outcome) => outcome.includes(itemContent)).
            map(({id, outcome}: Outcome) => ({
                id,
                text: getEllipsedText(outcome),
            }));
    }
    if (formatStringToLowerCase(name as string) === ecosystemAttachmentsWidget) {
        suggestions = sectionInfo.attachments.
            filter(({attachment}: Attachment) => attachment.includes(itemContent)).
            map(({id, attachment}: Attachment) => ({
                id,
                text: getEllipsedText(attachment),
            }));
    }
    return {suggestions};
};

const getListData = async (
    {object}: HyperlinkSuggestion,
    {url}: Widget,
): Promise<ListData | null> => {
    let widgetUrl = url as string;
    if (object) {
        widgetUrl = formatUrlWithId(widgetUrl, object.id);
    }
    const data = await fetchListData(widgetUrl);
    if (!data) {
        return null;
    }
    return data;
};

const getEllipsedText = (text: string): string => {
    return text.length < MAX_SUGGESTION_LENGTH ?
        text :
        `${text.substring(0, MAX_SUGGESTION_LENGTH).trim()}...`;
};