import {Client4} from 'mattermost-redux/client';
import {GlobalState} from '@mattermost/types/store';
import React from 'react';
import {Store} from 'redux';
import {render} from 'react-dom';

import {
    DEFAULT_PATH,
    DOCUMENTATION_PATH,
    PRODUCT_DOCUMENTATION,
    PRODUCT_ICON,
    PRODUCT_NAME,
} from 'src/constants';
import {DEFAULT_PLATFORM_CONFIG_PATH, setPlatformConfig} from 'src/config/config';
import {loadPlatformConfig, setSiteUrl} from 'src/clients';
import Backstage from 'src/components/backstage/backstage';
import {HiddenIcon, InfoIcon, RHSIcon} from 'src/components/icons';
import {GlobalSelectStyle} from 'src/components/backstage/styles';
import RHSView from 'src/components/rhs/rhs';
import {pluginId} from 'src/manifest';

import {messageWillBePosted, messageWillBeUpdated, slashCommandWillBePosted} from './hooks';
import {navigateToPluginUrl} from './browser_routing';
import withPlatformOperations from './components/hoc/with_platform_operations';

type WindowObject = {
    location: {
        origin: string;
        protocol: string;
        hostname: string;
        port: string;
    };
    basename?: string;
}

const GlobalHeaderCenter = () => {
    return null;
};

const GlobalHeaderRight = () => {
    return null;
};

const getSiteURLFromWindowObject = (obj: WindowObject): string => {
    let siteURL = '';
    if (obj.location.origin) {
        siteURL = obj.location.origin;
    } else {
        siteURL = obj.location.protocol + '//' + obj.location.hostname + (obj.location.port ? ':' + obj.location.port : '');
    }

    if (siteURL[siteURL.length - 1] === '/') {
        siteURL = siteURL.substring(0, siteURL.length - 1);
    }

    if (obj.basename) {
        siteURL += obj.basename;
    }

    if (siteURL[siteURL.length - 1] === '/') {
        siteURL = siteURL.substring(0, siteURL.length - 1);
    }

    return siteURL;
};

const getSiteURL = (): string => {
    return getSiteURLFromWindowObject(window);
};

export default class Plugin {
    stylesContainer?: Element;

    doRegistrations(registry: any, store: Store<GlobalState>): void {
        registry.registerTranslations((locale: string) => {
            try {
                // TODO: make async, this increases bundle size exponentially
                // eslint-disable-next-line global-require
                return require(`../i18n/${locale}.json`);
            } catch {
                return {};
            }
        });

        // eslint-disable-next-line react/require-optimization
        const BackstageWrapped = () => (
            <Backstage/>
        );

        const enableTeamSidebar = true;
        const enableAppBarComponent = true;

        registry.registerProduct(
            `/${DEFAULT_PATH}`,
            PRODUCT_ICON,
            PRODUCT_NAME,
            `/${DEFAULT_PATH}`,
            BackstageWrapped,
            GlobalHeaderCenter,
            GlobalHeaderRight,
            enableTeamSidebar,
            enableAppBarComponent,
            PRODUCT_ICON,
        );

        const {toggleRHSPlugin} = registry.registerRightHandSidebarComponent(RHSView, PRODUCT_NAME);
        registry.registerChannelHeaderButtonAction(
            <RHSIcon/>,
            () => store.dispatch(toggleRHSPlugin),
            PRODUCT_NAME,
            PRODUCT_NAME,
        );

        registry.registerChannelHeaderButtonAction(
            <InfoIcon/>,
            () => navigateToPluginUrl(`/${DOCUMENTATION_PATH}`),
            PRODUCT_DOCUMENTATION,
            PRODUCT_DOCUMENTATION,
        );

        registry.registerChannelHeaderButtonAction(withPlatformOperations(HiddenIcon), () => null, '', '');

        registry.registerSlashCommandWillBePostedHook(slashCommandWillBePosted);
        registry.registerMessageWillBePostedHook(messageWillBePosted);
        registry.registerMessageWillBeUpdatedHook(messageWillBeUpdated);

        // registry.registerMessageWillFormatHook(messageWillFormat);
    }

    public initialize(registry: any, store: Store<GlobalState>): void {
        this.stylesContainer = document.createElement('div');
        document.body.appendChild(this.stylesContainer);
        render(<><GlobalSelectStyle/></>, this.stylesContainer);

        // Consume the SiteURL so that the client is subpath aware. We also do this for Client4
        // in our version of the mattermost-redux, since webapp only does it in its copy.
        const siteUrl = getSiteURL();
        setSiteUrl(siteUrl);
        Client4.setUrl(siteUrl);

        loadPlatformConfig(DEFAULT_PLATFORM_CONFIG_PATH, setPlatformConfig);

        this.doRegistrations(registry, store);
    }
}

// @ts-ignore
window.registerPlugin(pluginId, new Plugin());
