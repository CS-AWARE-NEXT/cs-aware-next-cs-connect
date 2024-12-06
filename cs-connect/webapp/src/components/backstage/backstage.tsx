// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {Theme, getTheme} from 'mattermost-redux/selectors/entities/preferences';
import {
    Route,
    Switch,
    matchPath,
    useLocation,
    useRouteMatch,
} from 'react-router-dom';
import styled, {css} from 'styled-components';
import {GlobalState} from '@mattermost/types/store';
import {useSelector} from 'react-redux';

import {
    DEFAULT_PATH,
    DOCUMENTATION_PATH,
    ORGANIZATIONS_PATH,
    ORGANIZATION_ID_PARAM,
    PRODUCT_NAME,
} from 'src/constants';
import {applyTheme} from 'src/components/backstage/css_utils';
import {hideAnnouncementBar, useForceDocumentTitle} from 'src/hooks';
import Documentation from 'src/components/documentation/documentation';

import LHSNavigation from './lhs/lhs_navigation';
import MainBody from './main_body';
import {ToastProvider} from './toast_banner';

export const BackstageID = 'organization-backstageRoot';

const Backstage = () => {
    const {pathname} = useLocation();
    const {url} = useRouteMatch();
    const noContainerScroll = matchPath<{organizationId?: string;}>(pathname, {
        path: [`${url}/${ORGANIZATIONS_PATH}/:${ORGANIZATION_ID_PARAM}`, `${url}/${DEFAULT_PATH}`],
    });

    const currentTheme = useSelector<GlobalState, Theme>(getTheme);
    useEffect(() => {
        // This class, critical for all the styling to work, is added by ChannelController,
        // which is not loaded when rendering this root component.
        document.body.classList.add('app__body');
        const root = document.getElementById('root');
        if (root) {
            root.className += ' channel-view';
        }

        applyTheme(currentTheme);
        return function cleanUp() {
            document.body.classList.remove('app__body');
        };
    }, [currentTheme]);

    useEffect(() => {
        const interval = hideAnnouncementBar();
        return () => {
            clearInterval(interval);
        };
    });

    useForceDocumentTitle(PRODUCT_NAME);

    return (
        <BackstageContainer id={BackstageID}>
            <ToastProvider>
                <MainContainer noContainerScroll={Boolean(noContainerScroll)}>
                    <Switch>
                        <Route path={`${url}/${DOCUMENTATION_PATH}`}>
                            <Documentation/>
                        </Route>
                        <Route path={`${url}/`}>
                            <LHSNavigation/>
                            <MainBody/>
                        </Route>
                    </Switch>
                </MainContainer>
            </ToastProvider>
        </BackstageContainer>
    );
};

const BackstageContainer = styled.div`
    background: var(--center-channel-bg);
    overflow-y: auto;
    height: 100%;
`;

const MainContainer = styled.div<{noContainerScroll: boolean}>`
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: max-content auto;
    ${({noContainerScroll}) => (noContainerScroll ? css`
        height: 100%;
    ` : css`
        min-height: 100%;
    `)}
`;

export default Backstage;

