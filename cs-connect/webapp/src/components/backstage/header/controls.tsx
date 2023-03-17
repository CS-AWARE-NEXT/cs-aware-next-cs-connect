// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {FormattedMessage, useIntl} from 'react-intl';
import styled, {css} from 'styled-components';
import {LinkVariantIcon} from '@mattermost/compass-icons/components';
import React from 'react';

import {SecondaryButton} from 'src/components/assets/buttons';
import {StyledDropdownMenuItem} from 'src/components/backstage/shared';
import {copyToClipboard} from 'src/utils';
import {useToaster} from 'src/components/backstage/toast_banner';

type Props = {
    path: string;
    placeholder?: string;
    showIcon?: boolean;
    showPlaceholder?: boolean;
    svgMarginRight?: string;
    text: string;
};

export const formatUrlAsMarkdown = (path: string, text: string) => {
    return `[${text}](${path})`;
};

export const CopyLinkMenuItem = ({
    path,
    placeholder,
    showIcon = true,
    showPlaceholder = true,
    svgMarginRight,
    text,
}: Props) => {
    const {formatMessage} = useIntl();
    const {add: addToast} = useToaster();

    const placeholderText = placeholder ? <span>{placeholder}</span> : <FormattedMessage defaultMessage='Copy link'/>;
    return (
        <StyledDropdownMenuItem
            svgMarginRight={svgMarginRight}
            onClick={() => {
                copyToClipboard(formatUrlAsMarkdown(path, text));
                addToast({content: formatMessage({defaultMessage: 'Copied!'})});
            }}
        >
            {showIcon && <LinkVariantIcon size={16}/>}
            {showPlaceholder && placeholderText}
        </StyledDropdownMenuItem>
    );
};

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

export const SecondaryButtonLarger = styled(SecondaryButton)`
    ${buttonCommon};
`;