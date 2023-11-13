// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FormattedMessage, useIntl} from 'react-intl';
import React, {Dispatch} from 'react';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import styled from 'styled-components';
import {useSelector} from 'react-redux';

import {AutomationHeader, AutomationLabel, AutomationTitle} from 'src/components/backstage/widgets/channels/styles';
import {HorizontalSpacer, HorizontalSplit, VerticalSplit} from 'src/components/backstage/grid';
import {ChannelCreation} from 'src/types/channels';
import ChannelSelector from 'src/components/backstage/channel_selector';
import {ErrorMessage} from 'src/components/commons/messages';
import {PatternedInput} from 'src/components/backstage/widgets/channels/patterned_input';
import {RadioInput} from 'src/components/backstage/styles';
import {channelCreationAction} from 'src/actions';

type Props = {
    channelCreation: ChannelCreation;
    selectErrorMessage: string,
    nameErrorMessage: string,
    dispatchChannelCreation: Dispatch<any>;
    cleanErrorMessages: () => void,
    setChangesMade?: (b: boolean) => void;
};

export const CreateAChannel = ({
    channelCreation,
    selectErrorMessage,
    nameErrorMessage,
    dispatchChannelCreation,
    cleanErrorMessages,
    setChangesMade,
}: Props) => {
    const {formatMessage} = useIntl();
    const teamId = useSelector(getCurrentTeamId);
    const archived = false;

    const handlePublicChange = (isPublic: boolean) => {
        cleanErrorMessages();
        dispatchChannelCreation(channelCreationAction({
            ...channelCreation,
            createPublicChannel: isPublic,
        }));
        setChangesMade?.(true);
    };

    const handleChannelNameTemplateChange = (channelName: string) => {
        cleanErrorMessages();
        dispatchChannelCreation(channelCreationAction({
            ...channelCreation,
            channelName,
        }));
        setChangesMade?.(true);
    };

    const handleChannelModeChange = (mode: 'create_new_channel' | 'link_existing_channel') => {
        cleanErrorMessages();
        dispatchChannelCreation(channelCreationAction({
            ...channelCreation,
            channelMode: mode,
        }));
        setChangesMade?.(true);
    };

    const handleChannelIdChange = (channel_id: string) => {
        cleanErrorMessages();
        dispatchChannelCreation(channelCreationAction({
            ...channelCreation,
            channelId: channel_id,
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
            {/* <AutomationHeader id={'link-existing-channel'}>
                <AutomationTitle {...attrs}>
                    <AutomationLabel disabled={archived}>
                        <ChannelModeRadio
                            type='radio'
                            disabled={archived}
                            checked={channelCreation.channelMode === 'link_existing_channel'}
                            onChange={() => handleChannelModeChange('link_existing_channel')}
                        />
                        <FormattedMessage defaultMessage='Link to an existing channel'/>
                    </AutomationLabel>
                </AutomationTitle>
                <SelectorWrapper>
                    <StyledChannelSelector
                        id={'link_existing_channel_selector'}
                        onChannelSelected={(channel_id: string) => handleChannelIdChange(channel_id)}
                        channelIds={channelCreation.channelId === '' ? [] : [channelCreation.channelId]}
                        isClearable={true}
                        selectComponents={{ClearIndicator, DropdownIndicator: () => null, IndicatorSeparator: () => null, MenuList}}
                        isDisabled={archived || channelCreation.channelMode === 'create_new_channel'}
                        captureMenuScroll={false}
                        shouldRenderValue={true}
                        teamId={teamId}
                        isMulti={false}
                    />
                    <ErrorMessage display={selectErrorMessage !== ''}>
                        {selectErrorMessage}
                    </ErrorMessage>
                </SelectorWrapper>
            </AutomationHeader> */}
            <AutomationHeader id={'create-new-channel'}>
                <AutomationTitle {...attrs}>
                    <AutomationLabel disabled={archived}>
                        <ChannelModeRadio
                            type='radio'
                            disabled={archived}
                            checked={channelCreation.channelMode === 'create_new_channel'}
                            onChange={() => handleChannelModeChange('create_new_channel')}
                        />
                        <FormattedMessage defaultMessage='Create a channel'/>
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

export const ButtonLabel = styled.label<{disabled: boolean}>`
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

export const StyledChannelSelector = styled(ChannelSelector)`
    background-color: ${(props) => (props.isDisabled ? 'rgba(var(--center-channel-bg-rgb), 0.16)' : 'var(--center-channel-bg)')};
    .playbooks-rselect__control {
        padding: 4px 16px 4px 3.2rem;

        &:before {
            left: 16px;
            top: 8px;
            position: absolute;
            color: rgba(var(--center-channel-color-rgb), 0.56);
            content: '\f0349';
            font-size: 18px;
            font-family: 'compass-icons', mattermosticons;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
    }
`;

export const ChannelModeRadio = styled(RadioInput)`
    && {
        margin: 0 8px;
    }
`;
