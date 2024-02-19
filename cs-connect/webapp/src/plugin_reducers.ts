import {combineReducers} from 'redux';

import {
    EDIT_ECOSYSTEM_GRAPH,
    EXPORT_CHANNEL,
    EditEcosystemGraphAction,
    SetExportAction,
} from './action_types';

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

export const editEcosystemGraph = (
    state = '',
    {type, visible}: EditEcosystemGraphAction,
): {visible: boolean}|string => {
    switch (type) {
    case EDIT_ECOSYSTEM_GRAPH:
        return {visible}; // new object to always trigger a refresh
    default:
        return state;
    }
};

export default combineReducers({
    setExportChannel,
    editEcosystemGraph,
});
