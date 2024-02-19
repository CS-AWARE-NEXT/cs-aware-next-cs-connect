import React, {ComponentType, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {useSelector} from 'react-redux';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';
import {getCurrentChannelId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';

import {
    useChannelById,
    useHideOptions,
    useSuggestions,
    useUserAdded,
} from 'src/hooks';
import Suggestions from 'src/components/chat/suggestions';
import {channelNameSelector, teamNameSelector} from 'src/selectors';
import {getShowOptionsConfig} from 'src/config/config';

import {Exporter} from 'src/components/commons/export';

const withPlatformOperations = (Component: ComponentType): (props: any) => JSX.Element => {
    return (props: any): JSX.Element => {
        useUserAdded();

        const showOptionsConfig = getShowOptionsConfig();
        useHideOptions(showOptionsConfig);
        const [suggestions, isVisible, setIsVisible] = useSuggestions();

        // TODO: Maybe yiou can also add the current user id to the local storage
        // it can be useful for example for the update policy action to prevent a user to add posts from other users to policies
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

        const channelByID = useChannelById(channelId);

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
                {channelByID &&
                <Exporter
                    parentId={channelByID.parentId}
                    sectionId={channelByID.sectionId}
                />}
            </>
        );
    };
};

export default withPlatformOperations;
