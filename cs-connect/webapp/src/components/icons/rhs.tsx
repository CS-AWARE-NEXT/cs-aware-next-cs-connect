import React, {useEffect, useRef} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {getCurrentChannelId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';
import qs from 'qs';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {
    RHS_OPEN,
    RHS_PARAM,
    RHS_PARAM_VALUE,
    ROOT,
} from 'src/components/rhs/rhs';
import {useUrlHash} from 'src/hooks';

export const RHSIcon = () => {
    const channelId = useSelector(getCurrentChannelId);
    const icon = useRef<HTMLElement>(null);
    const {search} = useLocation();
    const urlHash = useUrlHash();
    const history = useHistory();

    useEffect(() => {
        const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
        if (!queryParams.rhs) {
            const iconButton = icon.current?.parentElement;
            const root = document.getElementById(ROOT) as HTMLElement;
            if (!root.classList.contains(RHS_OPEN)) {
                iconButton?.click();
            }
        }
    }, [channelId, search, urlHash]);

    useEffect(() => {
        return () => {
            const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
            if (!queryParams.rhs) {
                const root = document.getElementById(ROOT) as HTMLElement;
                if (!root.classList.contains(RHS_OPEN)) {
                    const searchParams = new URLSearchParams();
                    searchParams.set(RHS_PARAM, RHS_PARAM_VALUE);
                    history.replace({
                        ...location,
                        search: `?${searchParams.toString()}`,
                        hash: '',
                    });
                }
            }
        };
    });

    return (
        <Icon
            className='icon fa fa-plug'
            id={'open-product-rhs'}
            ref={icon}
        />
    );
};

const Icon = styled.i`
    font-size: 15px;
    position: relative;
    top: -1px;
`;