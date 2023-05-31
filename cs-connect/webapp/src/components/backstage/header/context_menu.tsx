// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import DotMenu, {TitleButton} from 'src/components/commons/dot_menu';
import {SemiBoldHeading} from 'src/styles/headings';

import {CopyLinkMenuItem} from './controls';

type Props = {
    name: string;
    path: string;
};

export const ContextMenu = ({path, name}: Props) => {
    return (
        <>
            <DotMenu
                dotMenuButton={TitleButton}
                placement='bottom-start'
                icon={
                    <>
                        <Title>{name}</Title>
                        <i
                            className={'icon icon-chevron-down'}
                            data-testid='runDropdown'
                        />
                    </>
                }
            >
                <CopyLinkMenuItem
                    path={path}
                    text={name}
                />
            </DotMenu>
        </>
    );
};

const Title = styled.h1`
    ${SemiBoldHeading}
    letter-spacing: -0.01em;
    font-size: 16px;
    line-height: 24px;
    margin: 0;
    text-overflow: ellipsis;
    overflow: hidden;

    /* white-space: nowrap; */
`;

