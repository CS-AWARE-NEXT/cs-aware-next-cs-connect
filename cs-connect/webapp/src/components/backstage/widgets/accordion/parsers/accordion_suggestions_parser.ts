import {fetchSectionInfo} from 'src/clients';
import {
    getAndRemoveOneFromArray,
    parseWidgetElementSuggestionsByType,
    parseWidgetElementSuggestionsWithHint,
    parseWidgetSuggestions,
} from 'src/helpers';
import {SectionInfo, Widget} from 'src/types/organization';
import {HyperlinkSuggestion, ParseOptions, SuggestionsData} from 'src/types/parser';
import {Element} from 'src/types/scenario_wizard';
import {getOrganizationById} from 'src/config/config';
import {getSection} from 'src/hooks';

import {getElement} from './accordion_posts_parser';

const emptySuggestions = {suggestions: []};

export const parseAccordionWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    if (options?.isIssues) {
        const accordionTokens = getAccordionTokens(options?.clonedTokens, widget);
        return parseIssuesWidgetSuggestions(hyperlinkSuggestion, accordionTokens, options);
    }
    return parseNoIssuesWidgetSuggestions(hyperlinkSuggestion, widget);
};

export const parseAccordionWidgetSuggestionsWithHint = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    tokens: string[] | undefined,
    widget: Widget,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    if (!tokens || tokens.length < 1) {
        return emptySuggestions;
    }
    if (options?.isIssues) {
        return parseIssuesWidgetSuggestionsWithHint(hyperlinkSuggestion, tokens, options);
    }
    return parseNoIssuesWidgetSuggestionsWithHint(hyperlinkSuggestion, widget, tokens);
};

const parseNoIssuesWidgetSuggestions = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
): Promise<SuggestionsData> => {
    return emptySuggestions;
};

// TODO: refactor
const parseIssuesWidgetSuggestions = async (
    {object, section}: HyperlinkSuggestion,
    tokens: string[] | undefined,
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    if (!tokens) {
        return emptySuggestions;
    }
    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return emptySuggestions;
    }
    if (tokens.length < 1) {
        const suggestions = sectionInfo.elements.map((element: Element) => ({
            id: element.id,
            text: element.name,
        }));
        return {suggestions};
    }

    const element = getElement(sectionInfo, tokens);
    if (!element) {
        return emptySuggestions;
    }
    const {id, name, organizationId, parentId} = element;
    const elementOrganization = getOrganizationById(organizationId);
    const elementSection = getSection(parentId);
    const elementObject = {id, name};

    if (tokens.length < 1) {
        const suggestions = elementSection.widgets.
            filter((widget) => widget.name && widget.name !== '').
            map((widget) => ({
                id: `${widget.name}-${widget.type}`,
                text: widget.name as string,
            }));
        return {suggestions};
    }

    const hyperlinkSuggestion = await parseWidgetSuggestions(
        {
            organization: elementOrganization,
            section: elementSection,
            object: elementObject,
            suggestions: emptySuggestions,
        },
        tokens,
    );
    const suggestions = await parseWidgetElementSuggestionsByType(
        hyperlinkSuggestion,
        tokens,
        hyperlinkSuggestion.widget as Widget,
        buildOptions(options),
    );
    return suggestions;
};

const parseNoIssuesWidgetSuggestionsWithHint = async (
    hyperlinkSuggestion: HyperlinkSuggestion,
    widget: Widget,
    tokens: string[],
): Promise<SuggestionsData> => {
    return emptySuggestions;
};

// TODO: refactor
const parseIssuesWidgetSuggestionsWithHint = async (
    {object, section}: HyperlinkSuggestion,
    tokens: string[],
    options?: ParseOptions,
): Promise<SuggestionsData> => {
    const sectionInfo = await fetchSectionInfo(object?.id as string, section?.url as string);
    if (!sectionInfo) {
        return emptySuggestions;
    }
    const elementName = getAndRemoveOneFromArray(tokens, 0);
    if (!elementName) {
        return emptySuggestions;
    }
    if (tokens.length < 1) {
        const suggestions = sectionInfo.elements.
            filter((e: Element) => e.name.includes(elementName)).
            map((element: Element) => ({
                id: element.id,
                text: element.name,
            }));
        return {suggestions};
    }

    const element = getElementByName(sectionInfo, elementName);
    if (!element) {
        return emptySuggestions;
    }
    const {id, name, organizationId, parentId} = element;
    const elementOrganization = getOrganizationById(organizationId);
    const elementSection = getSection(parentId);
    const elementObject = {id, name};

    let hyperlinkSuggestion = await parseWidgetSuggestions(
        {
            organization: elementOrganization,
            section: elementSection,
            object: elementObject,
            suggestions: emptySuggestions,
        },
        tokens,
    );
    if (tokens.length < 1) {
        return hyperlinkSuggestion.suggestions;
    }

    hyperlinkSuggestion = await parseWidgetElementSuggestionsWithHint(
        hyperlinkSuggestion,
        tokens,
        buildOptions(options),
    );
    return hyperlinkSuggestion.suggestions;
};

const getAccordionTokens = (tokens: string[] | undefined, {name}: Widget): string[] => {
    if (!tokens) {
        return [];
    }
    const widgetNameIndex = tokens.findIndex((token) => token === name);
    if (tokens.length === widgetNameIndex + 1) {
        return [];
    }
    return tokens.slice(widgetNameIndex + 1);
};

export const getElementByName = (sectionInfo: SectionInfo, name: string): Element | null => {
    const element = sectionInfo.elements.find((e: Element) => e.name === name);
    if (!element) {
        return null;
    }
    return element as Element;
};

const buildOptions = (options?: ParseOptions): ParseOptions => {
    return {
        isValueNeeded: options?.isValueNeeded,
        valueReference: options?.valueReference,
        reference: options?.reference,
    };
};