import {camelCase, startCase} from 'lodash';

import {
    MATTERMOST_CHANNEL_NAME_LENGTH,
    OBJECT_ID_TOKEN,
    ORGANIZATIONS_PATH,
    ORGANIZATION_ID_PARAM,
} from 'src/constants';

export const formatName = (name: string): string => {
    return name.replace(/\s/g, '-').
        replace('\'', '-').
        toLowerCase();
};

export const formatNameNoLowerCase = (name: string): string => {
    return name.replace(/\s/g, '-').
        replace('\'', '-');
};

export const formatPropertyName = (name: string): string => {
    return camelCase(name);
};

export const formatStringToLowerCase = (s: string): string => {
    return s.toLowerCase();
};

export const formatStringToCapitalize = (s: string): string => {
    return startCase(camelCase(s));
};

export const formatChannelName = (name: string): string => {
    let channelName = formatName(name);
    if (channelName.length < MATTERMOST_CHANNEL_NAME_LENGTH) {
        return channelName;
    }

    // 63 is Mattermost limit
    channelName = channelName.substring(0, MATTERMOST_CHANNEL_NAME_LENGTH - 1);
    const hyphenLastIndex = channelName.lastIndexOf('-');
    channelName = channelName.substring(0, hyphenLastIndex);
    return channelName;
};

export const isChannelNameCorrect = (name: string): string => {
    if (name.length > MATTERMOST_CHANNEL_NAME_LENGTH) {
        return `Channel name cannot be more than ${MATTERMOST_CHANNEL_NAME_LENGTH} characters long.`;
    }
    if (name.includes('(') || name.includes(')') || name.includes('.') || name.includes('[') || name.includes(']')) {
        return 'Channel name can only be made of letters, numbers, and \'-\'.';
    }
    return '';
};

export const isNameCorrect = (name: string): string => {
    if (name.length < 1) {
        return 'Name cannot be empty.';
    }
    if (name.includes('(') || name.includes(')') || name.includes('.') || name.includes('[') || name.includes(']')) {
        return 'Name can only be made of letters, numbers, and \'-\'.';
    }
    return '';
};

export const formatUrlWithId = (url: string, id: string): string => {
    return url.replace(OBJECT_ID_TOKEN, id);
};

export const formatSectionPath = (path: string, organizatioId: string): string => {
    const formattedPath = path.replace(`:${ORGANIZATION_ID_PARAM}`, organizatioId);
    const organizationSegment = `/${ORGANIZATIONS_PATH}/`;
    const organizationIndex = path.indexOf(organizationSegment);
    const slashStartSearchIndex = organizationIndex + organizationSegment.length;
    const isSectionNameInPath = organizationIndex !== -1 && path.indexOf('/', slashStartSearchIndex) !== -1;
    if (!isSectionNameInPath) {
        return formattedPath;
    }
    const lastSlashIndex = formattedPath.lastIndexOf('/');
    return formattedPath.substring(0, lastSlashIndex);
};

export const removeSectionNameFromPath = (path: string, sectionName: string) => {
    const lowerCaseSectioName = formatStringToLowerCase(sectionName);
    const sectionSegment = `/${lowerCaseSectioName}`;
    const sectionSegmentIndex = path.indexOf(sectionSegment);
    const isSectionNameInPath = sectionSegmentIndex !== -1;
    if (!isSectionNameInPath) {
        return path;
    }
    return path.replace(sectionSegment, '');
};
