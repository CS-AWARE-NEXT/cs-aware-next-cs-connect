import {ORGANIZATIONS_PATH, ORGANIZATION_ID_PARAM} from 'src/constants';

export const formatName = (name: string): string => {
    return name.replace(/\s/g, '-').toLowerCase();
};

export const formatStringToLowerCase = (s: string): string => {
    return s.toLowerCase();
};

export const formatStringToCapitalize = (s: string): string => {
    return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
};

export const formatUrlWithId = (url: string, id: string): string => {
    return url.replace(':id', id);
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
