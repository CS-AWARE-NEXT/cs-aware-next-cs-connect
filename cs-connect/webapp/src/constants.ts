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
export const estimatedAnnouncementBarsLoadTime = 50;

export const MATTERMOST_CHANNEL_NAME_LENGTH = 64;

export const UNKNOWN = '(?)';
export const TOKEN_SEPARATOR = '.';

export const PRODUCT_ICON = 'power-plug-outline';
export const PRODUCT_NAME = pluginName;
export const PRODUCT_DOCUMENTATION = 'Documentation';
export const ECOSYSTEM_GRAPH_EDIT_LABEL = 'Ecosystem Graph';

export const DEFAULT_PATH = pluginId;
export const ORGANIZATIONS_PATH = 'organizations';
export const ORGANIZATION_PATH = 'organization';
export const DOCUMENTATION_PATH = 'documentation';

// In case you change these, pay attention to change the files
// where it was not possible to use the constants
export const ORGANIZATION_ID_PARAM = 'organizationId';
export const PARENT_ID_PARAM = 'parentId';
export const SECTION_ID_PARAM = 'sectionId';
export const OBJECT_ID_TOKEN = ':id';

// export const ecosystemObjectivesWidget = 'objectives and research area';
export const ecosystemObjectivesWidget = 'summary of event and questions for ecosystem';
export const ecosystemOutcomesWidget = 'outcomes';
export const ecosystemElementsWidget = 'support data';
export const ecosystemElementsFields = ['organization', 'name', 'description'];
export const ecosystemRolesWidget = 'participants and roles';
export const ecosystemRolesFields = ['user', 'roles'];
export const ecosystemAttachmentsWidget = 'attachments';
