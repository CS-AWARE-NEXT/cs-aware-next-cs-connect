import {getSiteUrl} from 'src/clients';
import {PARENT_ID_PARAM, SECTION_ID_PARAM} from 'src/constants';

export const getUrlWithoutQueryParams = () => {
    const currentUrlWithoutQueryParams = window.location.href.split('?')[0];
    return currentUrlWithoutQueryParams;
};

export const getUrlWithoutQueryParamsAndFragment = () => {
    let currentUrlWithoutQueryParams = window.location.href;
    currentUrlWithoutQueryParams = currentUrlWithoutQueryParams.split('#')[0];
    currentUrlWithoutQueryParams = currentUrlWithoutQueryParams.split('?')[0];
    return currentUrlWithoutQueryParams;
};

export const getUrlWithoutFragment = () => {
    let currentUrlWithoutQueryParams = window.location.href;
    currentUrlWithoutQueryParams = currentUrlWithoutQueryParams.split('#')[0];
    return currentUrlWithoutQueryParams;
};

export const isUrlEqualWithoutQueryParams = (url: string) => {
    const currentUrlWithoutQueryParams = window.location.href.split('?')[0];
    return currentUrlWithoutQueryParams === url || `${currentUrlWithoutQueryParams}/` === url;
};

export const isReferencedByUrlHash = (urlHash: string, id: string): boolean => {
    return urlHash === `#${id}`;
};

export const isValidUrl = (url?: string): boolean => {
    if (!url) {
        return false;
    }
    try {
        const _ = new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

export const buildIdForUrlHashReference = (prefix: string, id: string): string => {
    return `${prefix}-${id}`;
};

export const buildToForCopy = (to: string): string => {
    return `${getSiteUrl()}${to}`;
};

export const buildTo = (
    fullUrl: string,
    id: string,
    query: string | undefined,
    url: string
) => {
    const isFullUrlProvided = fullUrl !== '';
    let to = isFullUrlProvided ? fullUrl : url;
    const isQueryProvided = query || query !== '';
    to = isQueryProvided ? `${to}?${query}` : to;
    return `${to}#${id}`;
};

export const buildQuery = (parentId: string, sectionId: string | undefined) => {
    let query = `${PARENT_ID_PARAM}=${parentId}`;
    if (sectionId) {
        query = `${query}&${SECTION_ID_PARAM}=${sectionId}`;
    }
    return query;
};

export const buildEcosystemGraphUrl = (issues_url: string, append_last_path: boolean) => {
    let url = issues_url;
    if (append_last_path) {
        url = `${url}/ecosystem_graph`;
    }
    return url;
};

export const buildBaseProviderUrl = (sectionUrl: string): string => {
    // match the word "provider"
    const match = sectionUrl.match(/^(.*?\/[^/]*provider)/);
    if (!match) {
        throw new Error('No "provider" segment found in the URL.');
    }
    return match[1];
};