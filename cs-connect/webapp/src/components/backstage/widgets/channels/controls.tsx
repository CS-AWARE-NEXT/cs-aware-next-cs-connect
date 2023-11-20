import {FormattedMessage, useIntl} from 'react-intl';
import React, {Dispatch} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {ChannelCreation} from 'src/types/channels';
import {HorizontalSpacer, HorizontalSplit} from 'src/components/backstage/grid';
import {PARENT_ID_PARAM, SECTION_ID_PARAM} from 'src/constants';
import {addChannelErrorMessageAction, nameErrorMessageAction, selectErrorMessageAction} from 'src/actions';
import {ErrorMessage} from 'src/components/commons/messages';
import {addChannel} from 'src/clients';
import {navigateToUrl} from 'src/browser_routing';
import {teamNameSelector} from 'src/selectors';
import {PrimaryButtonLarger} from 'src/components/backstage/widgets/shared';
import {isChannelNameCorrect} from 'src/helpers';

type CreateChannelProps = {
    channelCreation: ChannelCreation;
    parentId: string;
    sectionId: string;
    teamId: string;
    userId: string;
    organizationId: string;
    addChannelErrorMessage: string;
    dispacthAddChannelErrorMessage: Dispatch<any>;
    dispatchNameErrorMessage: Dispatch<any>;
    dispatchSelectErrorMessage: Dispatch<any>;
};

const createChannel = (
    channelCreation: ChannelCreation,
    parentId: string,
    sectionId: string,
    teamId: string,
    teamName: string,
    userId: string,
    organizationId: string,
    dispacthAddChannelErrorMessage: Dispatch<any>,
    dispatchNameErrorMessage: Dispatch<any>,
    dispatchSelectErrorMessage: Dispatch<any>,
) => {
    if (!channelCreation) {
        return;
    }
    if (!teamId) {
        dispacthAddChannelErrorMessage(addChannelErrorMessageAction('Please ensure the team is selected.'));
        return;
    }
    const {channelMode, channelId, channelName, createPublicChannel} = channelCreation;
    const createNewChannel = channelMode === 'create_new_channel';
    const linkExistingChannel = channelMode === 'link_existing_channel';
    if (linkExistingChannel && channelId === '') {
        dispatchSelectErrorMessage(selectErrorMessageAction('A channel has to be selected.'));
        return;
    }
    if (createNewChannel && channelName === '') {
        dispatchNameErrorMessage(nameErrorMessageAction('Channel name cannot be empty.'));
        return;
    }
    const errorMessage = isChannelNameCorrect(channelName);
    if (errorMessage !== '') {
        dispatchNameErrorMessage(nameErrorMessageAction(errorMessage));
        return;
    }

    addChannel({
        userId,
        channelId: linkExistingChannel ? channelId : undefined,
        channelName: createNewChannel ? channelName : undefined,
        createPublicChannel: createNewChannel ? createPublicChannel : false,
        parentId,
        sectionId,
        teamId,
        organizationId,
    }).
        then((result) => {
            navigateToUrl(`/${teamName}/channels/${result.channelId}?${SECTION_ID_PARAM}=${result.sectionId}&${PARENT_ID_PARAM}=${result.parentId}&from=channel_list`);
        }).
        catch(() => {
            dispacthAddChannelErrorMessage(addChannelErrorMessageAction('Please ensure the channel has not been added to other sections.'));
        });
};

export const CreateChannel = ({
    channelCreation,
    parentId,
    sectionId,
    teamId,
    userId,
    organizationId,
    addChannelErrorMessage,
    dispacthAddChannelErrorMessage,
    dispatchNameErrorMessage,
    dispatchSelectErrorMessage,
}: CreateChannelProps) => {
    const {formatMessage} = useIntl();
    let team = useSelector(teamNameSelector(teamId));
    if (!teamId) {
        team = {...team, display_name: 'All Teams', description: 'No team is selected'};
    }

    const title = formatMessage({defaultMessage: 'Create channel'});
    return (
        <Container>
            <HorizontalSplit>
                <PrimaryButtonLarger
                    onClick={() => createChannel(
                        channelCreation,
                        parentId,
                        sectionId,
                        teamId,
                        team.name,
                        userId,
                        organizationId,
                        dispacthAddChannelErrorMessage,
                        dispatchNameErrorMessage,
                        dispatchSelectErrorMessage,
                    )}
                    title={title}
                    data-testid='create-channel-button'
                >
                    <FormattedMessage defaultMessage='Create'/>
                </PrimaryButtonLarger>
                <HorizontalSpacer size={1}/>
                <ErrorMessage display={addChannelErrorMessage !== ''}>
                    {addChannelErrorMessage}
                </ErrorMessage>
            </HorizontalSplit>
        </Container>
    );
};

const Container = styled.div`
    margin-bottom: 16px;
`;
