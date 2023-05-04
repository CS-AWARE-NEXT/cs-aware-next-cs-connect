import {Organization, PlatformConfig} from 'src/types/organization';

export const DEFAULT_PLATFORM_CONFIG_PATH = '/configs/platform';
export const PLATFORM_CONFIG_CACHE_NAME = 'platform-config-cache';

const PATTERN_SYMBOL = ':symbol';
const PATTERN_PLACEHOLDER = `${PATTERN_SYMBOL}\\(.+?\\)`;

let platformConfig: PlatformConfig = {
    organizations: [],
};

let symbol = '';
let pattern: RegExp | null = null;

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
    if (symbol === '' || pattern === null) {
        symbol = 'hood';
        pattern = new RegExp(PATTERN_PLACEHOLDER.replace(PATTERN_SYMBOL, symbol), 'g');
    }
    return pattern;
};

export const getSymbol = (): string => {
    return symbol;
};