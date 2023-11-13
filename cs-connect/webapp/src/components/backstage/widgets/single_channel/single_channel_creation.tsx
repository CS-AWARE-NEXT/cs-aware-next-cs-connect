// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FormattedMessage, useIntl} from 'react-intl';
import React, {Dispatch} from 'react';
import styled from 'styled-components';

import {AutomationHeader, AutomationLabel, AutomationTitle} from 'src/components/backstage/widgets/channels/styles';
import {HorizontalSpacer, HorizontalSplit, VerticalSplit} from 'src/components/backstage/grid';
import {ChannelCreation} from 'src/types/channels';
import {ErrorMessage} from 'src/components/commons/messages';
import {PatternedInput} from 'src/components/backstage/widgets/channels/patterned_input';
import {channelCreationAction} from 'src/actions';

import {RadioInput} from 'src/components/backstage/styles';

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

    const handlePublicChange = (isPublic: boolean) => {
        cleanErrorMessages();
        dispatchChannelCreation(channelCreationAction({
            ...channelCreation,
            createPublicChannel: isPublic,
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
                    <VerticalSplit>
                        <ButtonLabel disabled={archived || channelCreation.channelMode === 'link_existing_channel'}>
                            <RadioInput
                                type='radio'
                                disabled={archived || channelCreation.channelMode === 'link_existing_channel'}
                                checked={channelCreation.createPublicChannel}
                                onChange={() => handlePublicChange(true)}
                            />
                            <Icon
                                disabled={channelCreation.channelMode === 'link_existing_channel'}
                                active={channelCreation.createPublicChannel}
                                className={'icon-globe'}
                            />
                            <BigText>{formatMessage({defaultMessage: 'Public'})}</BigText>
                        </ButtonLabel>
                        <HorizontalSpacer size={8}/>
                        <ButtonLabel disabled={archived || channelCreation.channelMode === 'link_existing_channel'}>
                            <RadioInput
                                type='radio'
                                disabled={archived || channelCreation.channelMode === 'link_existing_channel'}
                                checked={!channelCreation.createPublicChannel}
                                onChange={() => handlePublicChange(false)}
                            />
                            <Icon
                                disabled={channelCreation.channelMode === 'link_existing_channel'}
                                active={!channelCreation.createPublicChannel}
                                className={'icon-lock-outline'}
                            />
                            <BigText>{formatMessage({defaultMessage: 'Private'})}</BigText>
                        </ButtonLabel>
                    </VerticalSplit>
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

const ButtonLabel = styled.label<{disabled: boolean}>`
    padding: 10px 16px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    background: ${({disabled}) => (disabled ? 'rgba(var(--center-channel-color-rgb), 0.04)' : 'var(--center-channel-bg)')};
    border-radius: 4px;
    flex-grow: 1;
    flex-basis: 0;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    cursor: pointer;
`;

const Icon = styled.i<{ active?: boolean, disabled: boolean }>`
    font-size: 16px;
    line-height: 16px;
    color: ${({active, disabled}) => (active && !disabled ? 'var(--button-bg)' : 'rgba(var(--center-channel-color-rgb), 0.56)')};
`;

const BigText = styled.div`
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
`;
