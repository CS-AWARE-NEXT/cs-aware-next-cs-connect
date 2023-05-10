import {useEffect, useState} from 'react';

import {END_SYMBOL, getStartSymbol} from 'src/config/config';

export const useSuggestions = (): [Element | undefined, boolean] => {
    const suggestions = useCreateSuggestions();
    const isVisible = useHandleSuggestionsVisibility();
    return [suggestions, isVisible];
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

const useHandleSuggestionsVisibility = (): boolean => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const textarea = (document.getElementById('post_textbox') as HTMLTextAreaElement);

        const handleKeyDown = (event: KeyboardEvent) => {
            // console.log('Key pressed:', event.key);
            if (event.key === 'Enter') {
                setIsVisible(false);
                return;
            }
            if (event.key === 'Escape') {
                setIsVisible(false);
                return;
            }
            const startSymbol = getStartSymbol();
            const text = textarea.value;
            const cursorStartPosition = textarea.selectionStart;
            const cursorEndPosition = textarea.selectionEnd;

            // console.log('text', text, 'start', cursorStartPosition, 'char at start', text.charAt(cursorStartPosition - 1), 'end', cursorEndPosition, 'char at end', text.charAt(cursorEndPosition));
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
            const text = textarea.value;
            const pointerStartPosition = textarea.selectionStart;
            const symbolStartIndex = text.lastIndexOf(getStartSymbol(), pointerStartPosition);
            if (symbolStartIndex === -1) {
                setIsVisible(false);
                return;
            }
            const textBetweenCursorAndSymbol = text.substring(symbolStartIndex, pointerStartPosition);
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

    return isVisible;
};
