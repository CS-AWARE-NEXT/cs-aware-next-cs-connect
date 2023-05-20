import {
    Object,
    Organization,
    Section,
    Widget,
} from './organization';

export type HyperlinkReference = {
    object?: Object;
    organization?: Organization;
    section?: Section;
    widgetHash?: WidgetHash;
};

export type WidgetHash = {
    hash: string;
    text: string;
};

export type HyperlinkSuggestion = Omit<HyperlinkReference, 'widgetHash'> & {
    widget?: Widget;
    suggestions: SuggestionsData,
};

export type SuggestionsData = {
    suggestions: SuggestionData[];
};

export type SuggestionData = {
    id: string;
    text: string;
};

export type WidgetSuggestionsOptions = Partial<{
    withHint: boolean;
    reference: string;
}>;