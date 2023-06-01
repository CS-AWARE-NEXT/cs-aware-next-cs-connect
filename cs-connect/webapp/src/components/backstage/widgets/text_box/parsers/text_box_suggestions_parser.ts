import {getEmptySuggestions} from 'src/helpers';
import {SuggestionsData} from 'src/types/parser';

export const parseTextBoxWidgetSuggestions = (): SuggestionsData => {
    return getEmptySuggestions();
};