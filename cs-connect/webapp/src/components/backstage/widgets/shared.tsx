// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import styled, {css} from 'styled-components';
import React from 'react';
import {useRouteMatch} from 'react-router-dom';
import {Input} from 'antd';

import {buildIdForUrlHashReference, buildToForCopy} from 'src/hooks';
import {BaseInput} from 'src/components/assets/inputs';
import CopyLink from 'src/components/commons/copy_link';
import {PrimaryButton} from 'src/components/assets/buttons';

type AnchorLinkTitleProps = {
    fullUrl: string;
    id: string;
    query?: string;
    text: string;
    title: string;
};

const buildTo = (
    fullUrl: string,
    id: string,
    query: string | undefined,
    url: string,
) => {
    const isFullUrlProvided = fullUrl !== '';
    let to = isFullUrlProvided ? `${fullUrl}` : url;
    to = query ? `${to}?${query}` : to;
    return `${to}#${id}`;
};

export const AnchorLinkTitle = (props: AnchorLinkTitleProps) => {
    const {url} = useRouteMatch();
    const itemId = buildIdForUrlHashReference('section-link', props.id);

    return (
        <LinkTitle>
            <CopyLink
                id={itemId}
                text={props.text}
                to={buildToForCopy(buildTo(props.fullUrl, props.id, props.query, url))}
                name={props.title}
                area-hidden={true}
            />
            {props.title}
        </LinkTitle>
    );
};

const LinkTitle = styled.h3`
    font-family: Metropolis, sans-serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    padding-left: 8px;
    margin: 0;
    white-space: nowrap;
    display: inline-block;

    ${CopyLink} {
        margin-left: -1.25em;
        opacity: 1;
        transition: opacity ease 0.15s;
    }
    &:not(:hover) ${CopyLink}:not(:hover) {
        opacity: 0;
    }
`;

export const Separator = styled.hr`
    display: flex;
    align-content: center;
    border-top: 1px solid rgba(var(--center-channel-color-rgb),0.08);
    margin: 5px auto;
    width: 100%;
`;

export const Content = styled.div`
    background: var(--center-channel-bg);
    color: var(--center-channel-color);
    margin: 8px 0 0 0;
    padding: 0 8px 4px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
    border-radius: 8px;
`;

export const ExpandRight = styled.div`
    margin-left: auto;
`;

export const HelpText = styled.div`
    font-size: 12px;
    line-height: 16px;
    margin-top: 4px;
    color: rgba(var(--center-channel-color-rgb), 0.64);
    font-weight: 400;
`;

export const ErrorText = styled.div`
    font-size: 12px;
    line-height: 16px;
    margin-top: 4px;
    color: var(--error-text);
`;

export const StyledInput = styled(BaseInput)<{error?: boolean}>`
    height: 40px;
    width: 100%;

    background-color: ${(props) => (props.disabled ? 'rgba(var(--center-channel-color-rgb), 0.03)' : 'var(--center-channel-bg)')};

    ${(props) => (
        props.error && css`
            box-shadow: inset 0 0 0 1px var(--error-text);

            &:focus {
                box-shadow: inset 0 0 0 2px var(--error-text);
            }
        `
    )}

    scroll-margin-top: 36px;
`;

export const Header = styled.div`
    display: flex;
    flex: 1;
    margin-bottom: 8px;
`;

const buttonCommon = css`
    padding: 0 16px;
    height: 36px;
    gap: 8px;

    i::before {
        margin-left: 0;
        margin-right: 0;
        font-size: 1.05em;
    }
`;

export const PrimaryButtonLarger = styled(PrimaryButton)`
    ${buttonCommon};
`;

export const TextInput = styled(Input)`
    margin-bottom: 12px;
`;