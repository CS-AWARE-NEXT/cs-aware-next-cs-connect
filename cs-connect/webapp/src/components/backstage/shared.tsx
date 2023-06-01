// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import styled from 'styled-components';

import {DotMenuButton, DropdownMenuItem} from 'src/components/commons/dot_menu';

export const DotMenuButtonStyled = styled(DotMenuButton)`
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
`;

export const StyledDropdownMenuItem = styled(DropdownMenuItem)<{svgMarginRight?: string}>`
    display: flex;
    align-items: center;

    svg {
        margin-right: ${(props) => (props.svgMarginRight ? props.svgMarginRight : '11px')};
        fill: rgb(var(--center-channel-color-rgb), 0.56);
    }
`;

export const StyledDropdownMenuItemRed = styled(StyledDropdownMenuItem)`
    && {
        color: var(--dnd-indicator);

        svg {
            fill: var(--dnd-indicator);
        }

        :hover {
            background: var(--dnd-indicator);
            color: var(--button-color);

            svg {
                fill: var(--button-color);
            }
        }
    }
`;

export const RowContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

export const Container = styled.div`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(400px, 2fr) minmax(400px, 1fr);
    overflow-y: hidden;

    @media screen and (min-width: 1600px) {
        grid-auto-columns: 2.5fr 500px;
    }
`;

export const MainWrapper = styled.div`
    /* display: grid; */
    /* grid-template-rows: 56px 1fr; */
    grid-auto-flow: row;
    overflow-y: scroll;
    grid-auto-columns: minmax(0, 1fr);
`;

export const Main = styled.main`
    min-height: 0;
    padding: 0 20px 60px;
    display: grid;
    overflow-y: auto;
    /* Removed to make the main body span all the available blank space
        place-content: start center;
        grid-auto-columns: min(780px, 100%);
    */
`;

export const Body = styled(RowContainer)``;

export const Header = styled.header`
    /* height: 56px; */
    padding-top: 1%;
    min-height: fit-content;
    background-color: var(--center-channel-bg);
`;
