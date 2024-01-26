import {combineReducers} from 'redux';

import {EXPORT_CHANNEL, SetExportAction} from './action_types';

// Reducers that work off the Mattermost provided plugin store. Those get registered in the Mattermost registry.
export const setExportChannel = (
    state = '',
    {type, channelId}: SetExportAction,
): {channelId: string}|string => {
    switch (type) {
    case EXPORT_CHANNEL:
        return {channelId}; // new object to always trigger a refresh
    default:
        return state;
    }
};

export default combineReducers({
    setExportChannel,
});
