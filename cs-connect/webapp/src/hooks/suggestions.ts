import {
    Dispatch,
    SetStateAction,
    useEffect,
    useState,
} from 'react';

import {END_SYMBOL, getStartSymbol} from 'src/config/config';

import {
    getDefaultSuggestions,
    getOrganizationsSuggestions,
    getSuggestions,
    getSuggestionsReference,
    getSuggestionsTokens,
    getTextAndCursorPositions,
} from 'src/helpers';
import {SuggestionsData} from 'src/types/parser';

export const useSuggestions = (): [Element | undefined, boolean, Dispatch<SetStateAction<boolean>>] => {
    const suggestions = useCreateSuggestions();
    const [isVisible, setIsVisible] = useHandleSuggestionsVisibility();
    return [suggestions, isVisible, setIsVisible];
};

const useCreateSuggestions = (): Element | undefined => {
    const [suggestions, setSuggestions] = useState<Element | undefined>();
    useEffect(() => {
        const advancedTextEditorCell = document.getElementById('advancedTextEditorCell');
        if (!advancedTextEditorCell) {
            return;
        }
        const textareaWrapper = advancedTextEditorCell.querySelector('.textarea-wrapper');
        if (!textareaWrapper) {
            return;
        }
        const firstDivChild = textareaWrapper.querySelector('div:first-child');
        if (!firstDivChild) {
            return;
        }
        setSuggestions(firstDivChild);
    }, []);
    return suggestions;
};

const useHandleSuggestionsVisibility = (): [boolean, Dispatch<SetStateAction<boolean>>] => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const textarea = (document.getElementById('post_textbox') as HTMLTextAreaElement);

        const handleKeyDown = (event: KeyboardEvent) => {
            // console.log('Key pressed:', event.key);
            if (event.key === 'Enter') {
                // event.preventDefault();
                setIsVisible(false);
                return;
            }
            if (event.key === 'Escape') {
                // event.preventDefault();
                setIsVisible(false);

                // TODO: understand why does not focus, maybe de to how Escape is managed by Mattermost
                textarea.focus();
                return;
            }

            const startSymbol = getStartSymbol();
            const [text, cursorStartPosition, cursorEndPosition] = getTextAndCursorPositions(textarea);
            const symbolStartIndex = text.lastIndexOf(startSymbol, cursorStartPosition);
            if (symbolStartIndex === -1) {
                setIsVisible(false);
                return;
            }
            const textBetweenStartCursorAndSymbol = text.substring(symbolStartIndex, cursorStartPosition - 1);
            const textBetweenSymbolAndEndCursor = text.substring(symbolStartIndex, cursorEndPosition + 1);
            if (event.key === 'ArrowRight') {
                if (textBetweenSymbolAndEndCursor.length >= startSymbol.length && !textBetweenSymbolAndEndCursor.includes(END_SYMBOL)) {
                    setIsVisible(true);
                    return;
                }
                setIsVisible(false);
            }
            if (event.key === 'ArrowLeft') {
                if (textBetweenStartCursorAndSymbol.length >= startSymbol.length && !textBetweenStartCursorAndSymbol.includes(END_SYMBOL)) {
                    setIsVisible(true);
                    return;
                }
                setIsVisible(false);
            }
        };

        const handleInput = () => {
            const [text, cursorStartPosition] = getTextAndCursorPositions(textarea);
            const symbolStartIndex = text.lastIndexOf(getStartSymbol(), cursorStartPosition);
            if (symbolStartIndex === -1) {
                setIsVisible(false);
                return;
            }
            const textBetweenCursorAndSymbol = text.substring(symbolStartIndex, cursorStartPosition);
            if (textBetweenCursorAndSymbol.includes(END_SYMBOL)) {
                setIsVisible(false);
                return;
            }
            setIsVisible(true);
        };

        if (textarea) {
            textarea.addEventListener('input', handleInput);
            textarea.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            if (textarea) {
                textarea.removeEventListener('input', handleInput);
                textarea.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, []);

    return [isVisible, setIsVisible];
};

export const useSuggestionsData = (): SuggestionsData => {
    // TODO: move to useMemo in suggestions component
    const defaultData = getDefaultSuggestions();
    const organizationsData = getOrganizationsSuggestions();
    const [data, setData] = useState<SuggestionsData>(defaultData);

    useEffect(() => {
        console.log('useData');
        const textarea = (document.getElementById('post_textbox') as HTMLTextAreaElement);

        const handleInput = async () => {
            console.log('useData.handleInput');
            const tokens = getSuggestionsTokens(textarea);
            if (!tokens) {
                return;
            }
            const reference = getSuggestionsReference(textarea);
            if (reference === '') {
                setData(organizationsData);
                return;
            }

            console.log('tokens', tokens, 'reference', reference);
            const suggestions = await getSuggestions(tokens, reference);
            setData(suggestions);
        };

        textarea.addEventListener('input', handleInput);
        handleInput();

        return () => {
            if (textarea) {
                textarea.removeEventListener('input', handleInput);
            }
        };
    }, []);

    return data;
};
