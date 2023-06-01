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
    value?: string;
};

export type WidgetHashOrObjectForward = Partial<{
    widgetHash: WidgetHash,
    objectForward: Object;
}>;

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

export type ParseOptions = Partial<{
    match: string;
    parseMatch: string;
    clonedTokens: string[];

    isIssues: boolean;
    isRhsReference: boolean;
    withHint: boolean;

    // For text-box widget
    isValueNeeded: boolean;
    valueReference: string;

    // For table and paginated-table widget
    reference: string;
}>;