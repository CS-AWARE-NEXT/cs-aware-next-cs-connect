import React, {ComponentType, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {useSelector} from 'react-redux';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';

import {useHideOptions, useSuggestions, useUserAdded} from 'src/hooks';
import Suggestions from 'src/components/chat/suggestions';
import {channelNameSelector, teamNameSelector} from 'src/selectors';
import {getShowOptionsConfig} from 'src/config/config';

const withPlatformOperations = (Component: ComponentType): (props: any) => JSX.Element => {
    return (props: any): JSX.Element => {
        useUserAdded();

        const showOptionsConfig = getShowOptionsConfig();
        useHideOptions(showOptionsConfig);
        const [suggestions, isVisible, setIsVisible] = useSuggestions();

        const channelId = useSelector(getCurrentChannelId);
        const teamId = useSelector(getCurrentTeamId);
        const team = useSelector(teamNameSelector(teamId));
        const channel = useSelector(channelNameSelector(channelId));
        useEffect(() => {
            if (!channelId || !teamId) {
                return;
            }

            // localStorage.setItem('teamId', teamId);
            localStorage.setItem('teamName', team.name);
            localStorage.setItem('channelId', channelId);
            localStorage.setItem('channelName', channel.name);
        }, [channelId, teamId]);

        return (
            <>
                <Component {...props}/>
                {(suggestions && isVisible) &&
                    createPortal(
                        <Suggestions
                            setIsVisible={setIsVisible}
                        />,
                        suggestions,
                    )}
            </>
        );
    };
};

export default withPlatformOperations;
