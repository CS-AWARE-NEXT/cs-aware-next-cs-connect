import {
    CHANNEL_CREATION,
    EXPORT_CHANNEL,
    SET_ADD_CHANNEL_ERROR_MESSAGE,
    SET_NAME_ERROR_MESSAGE,
    SET_SELECT_ERROR_MESSAGE,
} from './action_types';
import {updatePolicyTemplateField} from './clients';
import {getEcosystem} from './config/config';
import {ChannelCreation} from './types/channels';
import {PolicyTemplateField} from './types/policy';

export const channelCreationAction = (channelCreation: ChannelCreation) => {
    return {
        type: CHANNEL_CREATION,
        channelCreation,
    };
};

export const addChannelErrorMessageAction = (addChannelErrorMessage = '') => {
    return {
        type: SET_ADD_CHANNEL_ERROR_MESSAGE,
        addChannelErrorMessage,
    };
};

export const nameErrorMessageAction = (nameErrorMessage = '') => {
    return {
        type: SET_NAME_ERROR_MESSAGE,
        nameErrorMessage,
    };
};

export const selectErrorMessageAction = (selectErrorMessage = '') => {
    return {
        type: SET_SELECT_ERROR_MESSAGE,
        selectErrorMessage,
    };
};

export const exportAction = (channelId: string) => {
    return {
        type: EXPORT_CHANNEL,
        channelId,
    };
};

export const updatePolicyTemplateFieldAction = (
    field: PolicyTemplateField,
    disableTimeout = false,
) => {
    let url = getEcosystem().sections[0].url;
    url = url.replace('issues', 'organizations/policies/template');
    updatePolicyTemplateField(field, url);

    if (disableTimeout) {
        return;
    }

    // We take advantage of Mattermost opening Threads after a post submenu is clicked
    // to open the RHS again after the Policy Template is updated, so we fetch RHS content again.
    setTimeout(() => {
        const openRhsButton = document.getElementById('open-product-rhs')?.parentElement;
        openRhsButton?.click();
    });
};