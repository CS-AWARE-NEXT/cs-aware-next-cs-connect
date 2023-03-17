import {getTeam} from 'mattermost-redux/selectors/entities/teams';
import {getChannel} from 'mattermost-redux/selectors/entities/channels';
import {GlobalState} from 'mattermost-webapp/packages/types/src/store';
import {Team} from 'mattermost-webapp/packages/types/src/teams';
import {Channel} from 'mattermost-webapp/packages/types/src/channels';

export const teamNameSelector = (teamId: string) => (state: GlobalState): Team => getTeam(state, teamId);
export const channelNameSelector = (channelId: string) => (state: GlobalState): Channel => getChannel(state, channelId);