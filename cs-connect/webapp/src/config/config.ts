import {Organization, PlatformConfig} from 'src/types/organization';

export const DEFAULT_PLATFORM_CONFIG_PATH = '/configs/platform';
export const PLATFORM_CONFIG_CACHE_NAME = 'platform-config-cache';

const PATTERN_SYMBOL = ':symbol';

// Match text in form of PATTERN_SYMBOL(...)
const PATTERN_PLACEHOLDER = `${PATTERN_SYMBOL}\\(.+?\\)`;

// Match text after PATTERN_SYMBOL( up until the ), if present
const SUGGESTION_PATTERN_PLACEHOLDER = `${PATTERN_SYMBOL}\\((?!.*\\)).*$`;

let platformConfig: PlatformConfig = {
    organizations: [],
};

let symbol = '';
let pattern: RegExp | null = null;
let suggestionPattern: RegExp | null = null;

export const getPlatformConfig = (): PlatformConfig => {
    return platformConfig;
};

export const setPlatformConfig = (config: PlatformConfig) => {
    if (!config) {
        return;
    }
    platformConfig = config;
};

export const getOrganizations = (): Organization[] => {
    return getPlatformConfig().organizations;
};

export const getOrganizationsNoEcosystem = (): Organization[] => {
    return getOrganizations().filter((o) => !o.isEcosystem);
};

export const getEcosystem = (): Organization => {
    return getOrganizations().filter((o) => o.isEcosystem)[0];
};

export const getOrganizationById = (id: string): Organization => {
    return getOrganizations().filter((o) => o.id === id)[0];
};

export const getOrganizationByName = (name: string): Organization => {
    return getOrganizations().filter((o) => o.name === name)[0];
};

export const getPattern = (): RegExp => {
    if (!pattern) {
        setSymbol();
        pattern = new RegExp(PATTERN_PLACEHOLDER.replace(PATTERN_SYMBOL, symbol), 'g');
    }
    return pattern;
};

export const getSuggestionPattern = (): RegExp => {
    if (!suggestionPattern) {
        setSymbol();
        suggestionPattern = new RegExp(SUGGESTION_PATTERN_PLACEHOLDER.replace(PATTERN_SYMBOL, symbol), 'g');
    }
    return suggestionPattern;
};

export const getSymbol = (): string => {
    return symbol;
};

const setSymbol = () => {
    if (symbol === '') {
        symbol = 'hood';
    }
};