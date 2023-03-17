
// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';

import WarningIcon from 'src/components/assets/icons/warning_icon';

const ErrorPage = () => {
    useEffect(() => {
        document.body.classList.add('error');
        return () => {
            document.body.classList.remove('error');
        };
    }, []);

    const title: React.ReactNode = 'Page not found';
    const message: React.ReactNode = 'The page you were trying to reach does not exist.';
    const returnTo = '/';
    const returnToMsg: React.ReactNode = 'Back to Mattermost';

    return (
        <div className='container-fluid'>
            <div className='error__container'>
                <div className='error__icon'>
                    <WarningIcon/>
                </div>
                <h2 data-testid='errorMessageTitle'>
                    <span>{title}</span>
                </h2>
                <p>
                    <span>{message}</span>
                </p>
                <Link to={returnTo}>
                    {returnToMsg}
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;
