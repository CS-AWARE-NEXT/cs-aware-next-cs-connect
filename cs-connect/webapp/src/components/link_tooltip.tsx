import React from 'react';

import {getSiteUrl} from 'src/clients';

import BacklinksAction from './commons/backlinks_action';

export const LinkTooltip = (props: any) => {
    const style = getStyle(props.theme);
    const siteURL = getSiteUrl();
    let parsedHref;
    try {
        parsedHref = new URL(props.href);
    } catch {
        return (null);
    }

    // Link tooltips only for cs-connect links
    if (!siteURL.includes(parsedHref.host)) {
        return (null);
    }

    return (
        <>
            <div
                style={style.configuration}
            >
                <BacklinksAction href={props.href}/>
            </div>
        </>
    );
};
const getStyle = (theme: any) => ({
    configuration: {
        borderRadius: '4px',
        boxShadow: 'rgba(61, 60, 64, 0.1) 0px 17px 50px 0px, rgba(61, 60, 64, 0.1) 0px 12px 15px 0px',
        fontSize: '14px',
        marginTop: '10px',
        padding: '10px 15px 15px',
        border: `1px solid ${hexToRGB(theme.centerChannelColor, '0.16')}`,
        color: theme.centerChannelColor,
        backgroundColor: theme.centerChannelBg,
    },
});

export const hexToRGB = (hex: any, alpha: any) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (alpha) {
        return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    }
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
};

