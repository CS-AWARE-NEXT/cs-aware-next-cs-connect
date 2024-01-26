import {
    CHANNEL_CREATION,
    EXPORT_CHANNEL,
    SET_ADD_CHANNEL_ERROR_MESSAGE,
    SET_NAME_ERROR_MESSAGE,
    SET_SELECT_ERROR_MESSAGE,
} from './action_types';
import {ChannelCreation} from './types/channels';

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
