import React from 'react';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import styled from 'styled-components';
import {useSelector} from 'react-redux';

import {PARENT_ID_PARAM, SECTION_ID_PARAM} from 'src/constants';
import {channelNameSelector, teamNameSelector} from 'src/selectors';
import {WidgetChannel} from 'src/types/channels';
import {navigateToUrl} from 'src/browser_routing';

type Props = {
    channel: WidgetChannel;
};

const Row = (props: Props) => {
    const channel = useSelector(channelNameSelector(props.channel.channelId));
    const teamId = useSelector(getCurrentTeamId);
    let team = useSelector(teamNameSelector(teamId));
    if (!teamId) {
        team = {...team, display_name: 'All Teams', description: 'No team is selected'};
    }

    const openChannel = (channelToOpenId: string, channelToOpenParentId: string, channelToOpenSectionId: string) => {
        navigateToUrl(`/${team.name}/channels/${channelToOpenId}?${SECTION_ID_PARAM}=${channelToOpenSectionId}&${PARENT_ID_PARAM}=${channelToOpenParentId}&from=channel_list`);
    };

    return (
        <>
            {channel &&
                <ChannelItem
                    className='row'
                    key={props.channel.channelId}
                    onClick={() => openChannel(channel.name, props.channel.parentId, props.channel.sectionId)}
                >
                    <div className='col-sm-4'>
                        <ChannelName>{channel.display_name}</ChannelName>
                    </div>
                </ChannelItem>
            }
        </>
    );
};

const ChannelItem = styled.div`
    display: flex;
    padding-top: 8px;
    padding-bottom: 8px;
    align-items: center;
    margin: 0;
    background-color: var(--center-channel-bg);
    border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
    cursor: pointer;

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.04);
    }
`;

const ChannelName = styled.div`
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
`;

export default Row;