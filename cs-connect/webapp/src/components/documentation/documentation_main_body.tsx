import {
    Redirect,
    Route,
    Switch,
    useRouteMatch,
} from 'react-router-dom';
import React, {useCallback} from 'react';

import {ErrorPageTypes} from 'src/constants';
import ErrorPage from 'src/components/commons/error_page';
import {pluginErrorUrl} from 'src/browser_routing';
import {useInitTeamRoutingLogic} from 'src/components/backstage/main_body';

import DocumentationPage from './documentation_page';
import {DocumentationItem} from './documentation';

type Props = {
    items: DocumentationItem[];
};

const DocumentationMainBody = ({items}: Props) => {
    const {url} = useRouteMatch();
    useInitTeamRoutingLogic();

    const getPathsFromItems = useCallback(() => items.map(({path}) => `${url}/${path}`), []);
    const paths = getPathsFromItems();

    return (
        <Switch>
            <Route
                path={paths}
            >
                <DocumentationPage items={items}/>
            </Route>
            <Route path={`${url}/error`}>
                <ErrorPage/>
            </Route>
            <Route
                exact={true}
                path={`${url}/`}
            >
                <Redirect to={`${url}/about`}/>
            </Route>
            <Route>
                <Redirect to={pluginErrorUrl(ErrorPageTypes.DEFAULT)}/>
            </Route>
        </Switch>
    );
};

export default DocumentationMainBody;
