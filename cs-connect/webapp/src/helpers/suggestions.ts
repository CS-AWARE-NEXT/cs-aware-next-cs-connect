import {fetchChannelById, fetchSectionInfo} from 'src/clients';
import {END_SYMBOL, getOrganizations, getStartSymbol} from 'src/config/config';
import {TOKEN_SEPARATOR} from 'src/constants';
import {
    parseRhsReference,
    parseTextToReference,
    parseTextToTokens,
    parseTokensToSuggestions,
    replaceAt,
} from 'src/helpers';
import {getSection} from 'src/hooks';
import {SuggestionData, SuggestionsData} from 'src/types/parser';

export const getTextAndCursorPositions = (textarea: HTMLTextAreaElement): [string, number, number] => {
    const text = textarea.value;
    const cursorStartPosition = textarea.selectionStart;
    const cursorEndPosition = textarea.selectionEnd;
    return [text, cursorStartPosition, cursorEndPosition];
};

export const getSuggestedText = (textarea: HTMLTextAreaElement, suggestion: string): string => {
    const tokens = getTokens(textarea, suggestion);

    const startSymbol = getStartSymbol();
    const suggestedReference = `${startSymbol}${tokens.join(TOKEN_SEPARATOR)}`;
    const reference = `${startSymbol}${getSuggestionsReference(textarea)}`;

    const [text, cursorStartPosition] = getTextAndCursorPositions(textarea);
    const [start, end] = calcReplaceStartAndEnd(text, reference, cursorStartPosition);
    const value = replaceAt(text, reference, suggestedReference, start, end);
    return value;
};

const getTokens = (textarea: HTMLTextAreaElement, suggestion: string): string[] => {
    const currentReference = getSuggestionsReference(textarea);
    const tokens = getSuggestionsTokens(textarea);
    const numberOfTokens = tokens.length;
    if (numberOfTokens < 1) {
        tokens[0] = suggestion;
        return tokens;
    }
    if (currentReference.endsWith(TOKEN_SEPARATOR)) {
        tokens[numberOfTokens] = suggestion;
        return tokens;
    }
    tokens[numberOfTokens - 1] = suggestion;
    return tokens;
};

const calcReplaceStartAndEnd = (
    text: string,
    reference: string,
    cursorStartPosition: number,
): [number, number] => {
    const symbolStartIndex = text.lastIndexOf(getStartSymbol(), cursorStartPosition);
    if (symbolStartIndex === -1) {
        return [-1, -1];
    }
    let symbolEndIndex = text.indexOf(END_SYMBOL, symbolStartIndex);
    if (symbolEndIndex === -1) {
        symbolEndIndex = symbolStartIndex + reference.length;
    }
    return [symbolStartIndex, symbolEndIndex];
};

export const getSuggestionsReference = (textarea: HTMLTextAreaElement): string => {
    const [text, cursorStartPosition] = getTextAndCursorPositions(textarea);
    const reference = parseTextToReference(text, cursorStartPosition);
    return reference;
};

export const getSuggestionsTokens = (textarea: HTMLTextAreaElement): string[] => {
    const [text, cursorStartPosition] = getTextAndCursorPositions(textarea);
    const tokens = parseTextToTokens(text, cursorStartPosition);
    return tokens;
};

export const getSuggestions = async (tokens: string[], reference: string): Promise<SuggestionsData> => {
    const [updatedTokens, isRhsReference, object] = await parseRhsReference(tokens);
    const objectSuggestion: SuggestionData | undefined = object ? {
        id: object.id,
        text: object.name,
    } : undefined;

    const suggestions = await parseTokensToSuggestions(updatedTokens, reference, {isRhsReference});
    if (!suggestions) {
        return {suggestions: objectSuggestion ? [objectSuggestion] : []};
    }
    return objectSuggestion ? {suggestions: [...suggestions.suggestions, objectSuggestion]} : suggestions;
};

export const getEmptySuggestions = (): SuggestionsData => {
    return {suggestions: []};
};

export const getOrganizationsSuggestions = (): SuggestionsData => {
    const suggestions = getOrganizations().
        map(({id, name}) => ({
            id,
            text: name,
        }));
    return {suggestions};
};

export const getAllSuggestionsForNoHint = async (): Promise<SuggestionsData> => {
    const {suggestions} = getOrganizationsSuggestions();
    const channelId = localStorage.getItem('channelId');
    const {channel} = await fetchChannelById(channelId as string);

    const {url} = getSection(channel.parentId);
    const {id, name} = await fetchSectionInfo(channel.sectionId, url);

    return {suggestions: [
        {
            id,
            text: name,
        },
        ...suggestions,
    ]};
};