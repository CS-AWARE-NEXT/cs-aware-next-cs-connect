// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {History} from 'history';

export const {
    formatText,
    messageHtmlToComponent,

    // @ts-ignore
} = global.PostUtils ?? {};

export const {
    modals,
    browserHistory,

// @ts-ignore
}: {modals: any, browserHistory: History} = global.WebappUtils ?? {};

export const {
    Timestamp,
    Textbox,

    // @ts-ignore
} = global.Components ?? {};

/* // https://github.com/mattermost/mattermost/blob/62f616dfbf47b25a153c26379fb62a72ef9f95bb/webapp/channels/src/plugins/export.js#L102
// hidden APIs that allow reusing Mattermost websocket client to contact the server
export const {
    useWebSocketClient,

    // @ts-ignore
} = global.ProductApi ?? {};
 */
