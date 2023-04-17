import {Organization, PlatformConfig} from 'src/types/organization';

export const DEFAULT_PLATFORM_CONFIG_PATH = '/configs/platform';
export const PLATFORM_CONFIG_CACHE_NAME = 'platform-config-cache';

let platformConfig: PlatformConfig = {
    organizations: [],
};

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