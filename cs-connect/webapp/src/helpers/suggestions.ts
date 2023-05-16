import {END_SYMBOL, getOrganizations, getStartSymbol} from 'src/config/config';
import {TOKEN_SEPARATOR} from 'src/constants';
import {
    parseTextToReference,
    parseTextToTokens,
    parseTokensToSuggestions,
    replaceAt,
} from 'src/helpers';
import {SuggestionsData} from 'src/types/parser';

export const getTextAndCursorPositions = (textarea: HTMLTextAreaElement): [string, number, number] => {
    const text = textarea.value;
    const cursorStartPosition = textarea.selectionStart;
    const cursorEndPosition = textarea.selectionEnd;
    return [text, cursorStartPosition, cursorEndPosition];
};

export const getSuggestedText = (textarea: HTMLTextAreaElement, suggestion: string): string => {
    const tokens = getTokens(textarea, suggestion);
    console.log('tokens', tokens, 'suggestion', suggestion);

    const startSymbol = getStartSymbol();
    const suggestedReference = `${startSymbol}${tokens.join(TOKEN_SEPARATOR)}`;
    const reference = `${startSymbol}${getSuggestionsReference(textarea)}`;

    const [text, cursorStartPosition] = getTextAndCursorPositions(textarea);
    const [start, end] = calcReplaceStartAndEnd(text, reference, cursorStartPosition);
    const value = replaceAt(text, reference, suggestedReference, start, end);
    console.log('value', value, 'reference', reference, 'suggestedReference', suggestedReference);
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
    const suggestions = await parseTokensToSuggestions(tokens, reference);
    if (!suggestions) {
        return {suggestions: []};
    }

    // console.log('Suggestions: ' + JSON.stringify(suggestions, null, 2));
    return suggestions;
};

export const getDefaultSuggestions = (): SuggestionsData => {
    return {suggestions: []};
};

export const getOrganizationsSuggestions = () => {
    const suggestions = getOrganizations().
        map(({id, name}) => ({
            id,
            text: name,
        }));
    return {suggestions};
};