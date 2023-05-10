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

        const handleKeyDown = (event: any) => {
            console.log('Key pressed:', event.key);
            if (event.key === 'Enter') {
                console.log('Closing because enter detected');
                setIsVisible(false);
                return;
            }
            handleInput();
        };

        const handleInput = () => {
            const text = textarea.value;
            const pointerStartPosition = textarea.selectionStart;

            // const match = currentText.match(getSuggestionPattern());
            // console.log('match', match);
            // if (match) {
            //     setIsVisible(true);
            // } else {
            //     setIsVisible(false);
            // }
            const symbolStartIndex = text.lastIndexOf(getStartSymbol(), pointerStartPosition);
            if (symbolStartIndex === -1) {
                setIsVisible(false);
                return;
            }
            const textBetweenCursorAndSymbol = text.substring(symbolStartIndex, pointerStartPosition);
            if (textBetweenCursorAndSymbol.includes(END_SYMBOL)) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
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