import {
    END_SYMBOL,
    getOrganizationBySectionName,
    getStartSymbol,
    getSymbol,
} from 'src/config/config';
import {TOKEN_SEPARATOR} from 'src/constants';
import {fetchChannelById, fetchSectionInfo} from 'src/clients';
import {getSection} from 'src/hooks';
import {SectionInfo} from 'src/types/organization';

import NoMoreTokensError from './errors/noMoreTokensError';

// TODO: study how to add support for ecosystem
export const parseRhsReference = async (tokens: string[])
: Promise<[
    string[],
    boolean,
    SectionInfo | undefined,
]> => {
    const channelId = localStorage.getItem('channelId');
    const {channel} = await fetchChannelById(channelId as string);

    const {name: sectionName, url} = getSection(channel.parentId);
    const {name: organizationName} = getOrganizationBySectionName(sectionName);
    const object = await fetchSectionInfo(channel.sectionId, url);
    const {name: objectName} = object;

    const referenceToken = tokens[0];
    const isRhsReference = referenceToken === objectName;
    if (isRhsReference) {
        return [
            [organizationName, sectionName, ...tokens],
            isRhsReference,
            undefined,
        ];
    }
    const isPartialRhsReference = objectName.includes(referenceToken);
    return [
        tokens,
        isRhsReference,
        isPartialRhsReference ? object : undefined,
    ];
};

export const parseTextToReference = (text: string, start: number): string => {
    const symbolStartIndex = text.lastIndexOf(getStartSymbol(), start);
    if (symbolStartIndex === -1) {
        return '';
    }
    let reference = text.substring(symbolStartIndex);
    const endSymbolIndex = reference.indexOf(END_SYMBOL);
    if (endSymbolIndex !== -1) {
        reference = reference.substring(0, endSymbolIndex);
    }
    reference = reference.substring(getStartSymbol().length);
    return reference;
};

export const parseTextToTokens = (text: string, start: number): string[] => {
    const reference = parseTextToReference(text, start);
    const tokens = reference.split(TOKEN_SEPARATOR);
    return tokens.filter((token) => token !== '');
};

export const parseMatchToTokens = (match: string): string[] => {
    const reference = extractReferenceFromMatch(match);
    if (!reference) {
        return [];
    }
    const tokens = reference.split(TOKEN_SEPARATOR);
    return tokens.filter((token) => token !== '');
};

const extractReferenceFromMatch = (match: string): string | null => {
    if (match === `${getSymbol()}()`) {
        return null;
    }
    return match.substring(getSymbol().length + 1, match.length - 1);
};

export const withTokensLengthCheck = async <T>(
    obj: T,
    tokens: string[],
    parse: (obj: T, tokens: string[]) => Promise<T>,
): Promise<T> => {
    if (tokens.length < 1) {
        throw new NoMoreTokensError('No more tokens to parse');
    }
    return parse(obj, tokens);
};
