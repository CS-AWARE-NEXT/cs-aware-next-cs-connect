// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {FC, HTMLAttributes, useState} from 'react';
import styled, {css} from 'styled-components';
import {FormattedMessage, useIntl} from 'react-intl';
import {LinkVariantIcon} from '@mattermost/compass-icons/components';
import {Property} from 'csstype';

import {OVERLAY_DELAY} from 'src/constants';
import Tooltip from 'src/components/commons/tooltip';
import {copyToClipboard} from 'src/utils';
import {formatUrlAsMarkdown} from 'src/helpers';
import {StyledDropdownMenuItem} from 'src/components/backstage/shared';
import {useToaster} from 'src/components/backstage/toast_banner';

import {ClickableImage, ClickableImageProps} from './image';

type CopyLinkMenuItemProps = {
    path: string;
    placeholder?: string;
    showIcon?: boolean;
    showPlaceholder?: boolean;
    svgMarginRight?: string;
    text: string;
    textStyle?: {
        color: string;
        fontSize: string;
        textAlign: Property.TextAlign | undefined;
    };
    hasHover?: boolean;
    className?: string;
    onContexMenu?: (e: React.MouseEvent) => void;
};

export const CopyLinkMenuItem: FC<CopyLinkMenuItemProps> = ({
    path,
    placeholder,
    showIcon = true,
    showPlaceholder = true,
    svgMarginRight,
    text,
    textStyle = {
        color: '',
        fontSize: '',
        textAlign: 'center',
    },
    hasHover = true,
    className = '',
    onContexMenu,
}) => {
    const {formatMessage} = useIntl();
    const {add: addToast} = useToaster();

    const placeholderText = placeholder ? <span>{placeholder}</span> : <FormattedMessage defaultMessage='Copy link'/>;
    return (
        <StyledDropdownMenuItem
            className={className}
            svgMarginRight={svgMarginRight}
            onClick={() => {
                copyToClipboard(formatUrlAsMarkdown(path, text));
                addToast({content: formatMessage({defaultMessage: 'Copied!'})});
            }}
            onContextMenu={onContexMenu}
            hasHover={hasHover}
        >
            {showIcon && <LinkVariantIcon size={16}/>}
            {showPlaceholder && <span style={textStyle}>{placeholderText}</span>}
        </StyledDropdownMenuItem>
    );
};

type CopyImageProps = {
    text: string;
    to: string;
    imageProps: ClickableImageProps;
};

export const CopyImage: FC<CopyImageProps> = ({
    text,
    to,
    imageProps,
}) => {
    const {formatMessage} = useIntl();
    const {add: addToast} = useToaster();

    const copyLink = (e: React.MouseEvent) => {
        copyToClipboard(formatUrlAsMarkdown(to, text));
        addToast({content: formatMessage({defaultMessage: 'Copied!'})});
    };

    return (
        <ClickableImage
            {...imageProps}
            onClick={copyLink}
        />
    );
};

type Props = {
    id: string;
    text: string;
    to: string;
    iconWidth?: string;
    iconHeight?: string;
} & ({
    name: string;
    tooltipMessage?: never
} | {
    name?: never;
    tooltipMessage: string;
});

type Attrs = HTMLAttributes<HTMLElement>;

const CopyLink: FC<Props & Attrs> = ({
    iconWidth,
    iconHeight,
    id,
    name,
    text,
    to,
    tooltipMessage,
    ...attrs
}) => {
    const {formatMessage} = useIntl();
    const [wasCopied, setWasCopied] = useState(false);

    const copyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        copyToClipboard(formatUrlAsMarkdown(to, text));
        setWasCopied(true);
    };

    return (
        <Tooltip
            id={id}
            placement='bottom'
            delay={OVERLAY_DELAY}
            onExited={() => setWasCopied(false)}
            shouldUpdatePosition={true}
            content={wasCopied ? formatMessage({defaultMessage: 'Copied!'}) : (tooltipMessage ?? formatMessage({defaultMessage: "Copy link to ''{name}''"}, {name}))}
        >
            <AutoSizeCopyIcon
                onClick={copyLink}
                clicked={wasCopied}
                {...attrs}
                className={'icon-link-variant ' + attrs.className}
                iconWidth={iconWidth}
                iconHeight={iconHeight}
            />
        </Tooltip>
    );
};

const CopyText: FC<Props & Attrs> = ({
    iconWidth,
    iconHeight,
    id,
    name,
    text,
    tooltipMessage,
    ...attrs
}) => {
    const {formatMessage} = useIntl();
    const [wasCopied, setWasCopied] = useState(false);

    const copyText = (e: React.MouseEvent) => {
        e.stopPropagation();
        copyToClipboard(text);
        setWasCopied(true);
    };

    return (
        <Tooltip
            id={id}
            placement='bottom'
            delay={OVERLAY_DELAY}
            onExited={() => setWasCopied(false)}
            shouldUpdatePosition={true}
            content={wasCopied ? formatMessage({defaultMessage: 'Copied!'}) : (tooltipMessage ?? formatMessage({defaultMessage: "Copy text from ''{name}''"}, {name}))}
        >
            <AutoSizeCopyIcon
                onClick={copyText}
                clicked={wasCopied}
                {...attrs}
                className={'icon-link-variant ' + attrs.className}
                iconWidth={iconWidth}
                iconHeight={iconHeight}
            />
        </Tooltip>
    );
};

export const StyledCopyText = styled(CopyText)``;

const CopyIcon = styled.button<{clicked: boolean, iconWidth?: string, iconHeight?: string}>`
    display: inline-block;

    border-radius: 4px;
    padding: 0;
    width: ${(props) => (props.iconWidth ? props.iconWidth : '1.25em')};
    height: ${(props) => (props.iconHeight ? props.iconHeight : '1.25em')};

    :before {
        margin: 0;
        vertical-align: baseline;
    }

    border: none;
    background: transparent;
    color: rgba(var(--center-channel-color-rgb), 0.56);


    ${({clicked}) => !clicked && css`
        &:hover {
            background: var(--center-channel-color-08);
            color: var(--center-channel-color-72);
        }
    `}

    ${({clicked}) => clicked && css`
        background: var(--button-bg-08);
        color: var(--button-bg);
    `}
`;

const AutoSizeCopyIcon = styled(CopyIcon)`
    font-size: inherit;
`;

export default styled(CopyLink)``;
