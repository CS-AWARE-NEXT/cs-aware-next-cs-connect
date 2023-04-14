import {
    Redirect,
    Route,
    Switch,
    useRouteMatch,
} from 'react-router-dom';
import React from 'react';

import {DOCUMENTATION_PATH, ErrorPageTypes} from 'src/constants';
import ErrorPage from 'src/components/commons/error_page';
import {pluginErrorUrl} from 'src/browser_routing';
import {useInitTeamRoutingLogic} from 'src/components/backstage/main_body';

import DocumentationPage from './documentation_page';

const DocumentationMainBody = () => {
    const match = useRouteMatch();
    useInitTeamRoutingLogic();

    return (
        <Switch>
            <Route
                path={[
                    `${match.url}/about`,
                    `${match.url}/mechanism`,
                ]}
            >
                <DocumentationPage/>
            </Route>
            <Route path={`${match.url}/error`}>
                <ErrorPage/>
            </Route>
            <Route
                exact={true}
                path={`${match.url}/${DOCUMENTATION_PATH}`}
            >
                <Redirect to={`${match.url}/about#about-the-platform`}/>
            </Route>
            <Route
                exact={true}
                path={`${match.url}/`}
            >
                <Redirect to={`${match.url}/about#about-the-platform`}/>
            </Route>
            <Route>
                <Redirect to={pluginErrorUrl(ErrorPageTypes.DEFAULT)}/>
            </Route>
        </Switch>
    );
};

export default DocumentationMainBody;
