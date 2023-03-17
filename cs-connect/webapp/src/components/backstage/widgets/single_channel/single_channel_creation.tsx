// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FormattedMessage, useIntl} from 'react-intl';
import React, {Dispatch} from 'react';
import styled from 'styled-components';

import {AutomationHeader, AutomationLabel, AutomationTitle} from 'src/components/backstage/widgets/channels/styles';
import {HorizontalSplit} from 'src/components/backstage/grid';
import {ChannelCreation} from 'src/types/channels';
import {ErrorMessage} from 'src/components/commons/messages';
import {PatternedInput} from 'src/components/backstage/widgets/channels/patterned_input';
import {channelCreationAction} from 'src/actions';

type Props = {
    channelCreation: ChannelCreation;
    nameErrorMessage: string,
    dispatchChannelCreation: Dispatch<any>;
    cleanErrorMessages: () => void,
    setChangesMade?: (b: boolean) => void;
};

export const CreateSingleChannel = ({
    channelCreation,
    nameErrorMessage,
    dispatchChannelCreation,
    cleanErrorMessages,
    setChangesMade,
}: Props) => {
    const {formatMessage} = useIntl();
    const archived = false;

    const handleChannelNameTemplateChange = (channelName: string) => {
        cleanErrorMessages();
        dispatchChannelCreation(channelCreationAction({
            ...channelCreation,
            channelName,
        }));
        setChangesMade?.(true);
    };

    const attrs = {
        css: {
            alignSelf: 'flex-start',
        },
    };

    return (
        <Container>
            <AutomationHeader id={'create-new-channel'}>
                <AutomationTitle {...attrs}>
                    <AutomationLabel disabled={archived}>
                        <ChannelText>
                            <FormattedMessage defaultMessage='Create channel'/>
                        </ChannelText>
                    </AutomationLabel>
                </AutomationTitle>
                <HorizontalSplit>
                    <PatternedInput
                        enabled={!archived && channelCreation.channelMode === 'create_new_channel'}
                        input={channelCreation.channelName}
                        onChange={handleChannelNameTemplateChange}
                        pattern={'[\\S][\\s\\S]*[\\S]'} // at least two non-whitespace characters
                        placeholderText={formatMessage({defaultMessage: 'Channel name'})}
                        type={'text'}
                        errorText={formatMessage({defaultMessage: 'Channel name is not valid.'})}
                    />
                    <ErrorMessage display={nameErrorMessage !== ''}>
                        {nameErrorMessage}
                    </ErrorMessage>
                </HorizontalSplit>
            </AutomationHeader>
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ChannelText = styled.div`
    font-size: 1.1em;
`;