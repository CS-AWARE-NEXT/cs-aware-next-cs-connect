import {DateTime} from 'luxon';

import {pluginId, pluginName} from 'src/manifest';

export const OVERLAY_DELAY = 400;

export enum ErrorPageTypes {
    DEFAULT = 'default',
}

export const TEMPLATE_TITLE_KEY = 'template_title';

export const BACKSTAGE_LIST_PER_PAGE = 15;

export const DateTimeFormats = {
    // eslint-disable-next-line no-undefined
    DATE_MED_NO_YEAR: {...DateTime.DATE_MED, year: undefined},
};

export const estimatedOptionsLoadTime = 150;

export const PRODUCT_ICON = 'power-plug-outline';
export const PRODUCT_NAME = pluginName;
export const PRODUCT_DOCUMENTATION = 'Documentation';

export const DEFAULT_PATH = pluginId;
export const ORGANIZATIONS_PATH = 'organizations';
export const ORGANIZATION_PATH = 'organization';
export const DOCUMENTATION_PATH = 'documentation';

// In case you change these, pay attention to change the files
// where it was not possible to use the constants
export const ORGANIZATION_ID_PARAM = 'organizationId';
export const PARENT_ID_PARAM = 'parentId';
export const SECTION_ID_PARAM = 'sectionId';

// TODO: those should be obtained using an API call, or another dynamic way
export const ecosystemDefaultFields = ['name', 'description'];