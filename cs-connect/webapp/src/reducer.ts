import {CombinedState, Reducer, combineReducers} from 'redux';

import {
    CHANNEL_CREATION,
    SET_ADD_CHANNEL_ERROR_MESSAGE,
    SET_NAME_ERROR_MESSAGE,
    SET_SELECT_ERROR_MESSAGE,
    SetAddChannelErrorMessageAction,
    SetChannelCreationAction,
    SetNameErrorMessageAction,
    SetSelectErrorMessageAction,
} from './action_types';
import {ChannelCreation} from './types/channels';

type AnyAction = any;
type AnyState = any;
export type CombinedReducer = Reducer<CombinedState<AnyState>, AnyAction> | any

export const setChannelCreation = (
    state: ChannelCreation,
    {type, channelCreation}: SetChannelCreationAction,
): ChannelCreation => {
    switch (type) {
    case CHANNEL_CREATION:
        return channelCreation;
    default:
        return state;
    }
};

export const setAddChannelErrorMessage = (
    state = '',
    {type, addChannelErrorMessage}: SetAddChannelErrorMessageAction,
): string => {
    switch (type) {
    case SET_ADD_CHANNEL_ERROR_MESSAGE:
        return addChannelErrorMessage;
    default:
        return state;
    }
};

export const setNameErrorMessage = (
    state = '',
    {type, nameErrorMessage}: SetNameErrorMessageAction,
): string => {
    switch (type) {
    case SET_NAME_ERROR_MESSAGE:
        return nameErrorMessage;
    default:
        return state;
    }
};

export const setSelectErrorMessage = (
    state = '',
    {type, selectErrorMessage}: SetSelectErrorMessageAction,
): string => {
    switch (type) {
    case SET_SELECT_ERROR_MESSAGE:
        return selectErrorMessage;
    default:
        return state;
    }
};

export default combineReducers({
    setNameErrorMessage,
    setSelectErrorMessage,
    setChannelCreation,
});