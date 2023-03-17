import {Organization, PlatformConfig} from 'src/types/organization';
import {ECOSYSTEM} from 'src/constants';
import {formatStringToLowerCase} from 'src/hooks';

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
    return getOrganizations().filter((o) => formatStringToLowerCase(o.name) !== ECOSYSTEM);
};

export const getEcosystem = (): Organization => {
    return getOrganizations().filter((o) => formatStringToLowerCase(o.name) === ECOSYSTEM)[0];
};

export const getOrganizationById = (id: string): Organization => {
    return getOrganizations().filter((o) => o.id === id)[0];
};