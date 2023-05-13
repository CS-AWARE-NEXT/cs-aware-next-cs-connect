import {NavLink, Route, Switch} from 'react-router-dom';
import React, {ReactNode} from 'react';
import styled from 'styled-components';

import {SECTION_ID_PARAM} from 'src/constants';
import {Section} from 'src/types/organization';
import SectionDetails from 'src/components/backstage/sections/section_details';
import SectionList from 'src/components/backstage/sections/section_list';
import {isUrlEqualWithoutQueryParams} from 'src/hooks';
import {formatStringToLowerCase} from 'src/helpers';
import {getSiteUrl} from 'src/clients';

type Props = {
    path: string;
    sections: Section[];
    url: string;
    children?: ReactNode;
    childrenBottom?: boolean;
};

const DEFAULT_SECTION = 0;
export const SECTION_NAV_ITEM = 'section-nav-item';
export const SECTION_NAV_ITEM_ACTIVE = 'active';

const Sections = ({
    path,
    sections,
    url,
    children = [],
    childrenBottom = true,
}: Props) => {
    const showChildren = isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}`);
    const safeSections = sections == null ? [] : sections;
    return (
        <>
            <NavBar>
                {safeSections.map((section, index) => {
                    let toUrl = `${url}/${formatStringToLowerCase(section.name)}`;
                    if (index === DEFAULT_SECTION) {
                        toUrl = url;
                    }
                    return (
                        <NavItem
                            key={`nav-item-${section.id}`}
                            to={toUrl}
                            exact={true}
                            className={`${SECTION_NAV_ITEM}`}
                        >
                            {section.name}
                        </NavItem>
                    );
                })}
            </NavBar>
            {(showChildren && !childrenBottom) && children}
            <Switch>
                {safeSections.length > 0 &&
                    <Route
                        key={`route-${safeSections[DEFAULT_SECTION].id}`}
                        path={path}
                        exact={true}
                    >
                        <SectionList section={safeSections[DEFAULT_SECTION]}/>
                    </Route>}
                {safeSections.map((section) => (
                    <Route
                        key={`route-${section.id}`}
                        path={`${path}/${formatStringToLowerCase(section.name)}`}
                        exact={true}
                    >
                        <SectionList section={section}/>
                    </Route>
                ))}
                {safeSections.map((section) => {
                    return (
                        <Route
                            key={`route-single-${section.id}`}
                            path={`${path}/${formatStringToLowerCase(section.name)}/:${SECTION_ID_PARAM}`}
                            exact={true}
                        >
                            <SectionDetails/>
                        </Route>
                    );
                })}
            </Switch>
            {(showChildren && childrenBottom) && children}
        </>
    );
};

const NavItem = styled(NavLink)`
    display: flex;
    align-items: center;
    text-align: center;
    padding: 20px 30px;
    font-weight: 600;

    && {
        color: rgba(var(--center-channel-color-rgb), 0.64);

        :hover {
            color: var(--button-bg);
        }

        :hover,
        :focus {
            text-decoration: none;
        }
    }

    &.active {
        color: var(--button-bg);
        box-shadow: inset 0px -3px 0px 0px var(--button-bg);
    }
`;

const NavBar = styled.nav`
    display: flex;
    width: 100%;
    justify-content: center;
    grid-area: nav;
    z-index: 2;
`;

export default Sections;