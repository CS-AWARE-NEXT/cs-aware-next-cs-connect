import {NavLink, Route, Switch} from 'react-router-dom';
import React from 'react';
import styled from 'styled-components';

import {SECTION_ID_PARAM} from 'src/constants';
import {Section} from 'src/types/organization';
import SectionDetails from 'src/components/backstage/sections/section_details';
import SectionList from 'src/components/backstage/sections/section_list';
import {formatStringToLowerCase} from 'src/hooks';

type Props = {
    path: string;
    sections: Section[];
    url: string;
};

export const SECTION_NAV_ITEM = 'section-nav-item';
export const SECTION_NAV_ITEM_ACTIVE = 'active';

const Sections = ({path, sections, url}: Props) => {
    const safeSections = sections == null ? [] : sections;
    return (
        <>
            <NavBar>
                {safeSections.map((section, index) => {
                    let toUrl = `${url}/${formatStringToLowerCase(section.name)}`;
                    if (index === 0) {
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
            <Switch>
                {safeSections.map((section, index) => {
                    let toPath = `${path}/${formatStringToLowerCase(section.name)}`;
                    if (index === 0) {
                        toPath = path;
                    }
                    return (
                        <Route
                            key={`route-${section.id}`}
                            path={toPath}
                            exact={true}
                        >
                            <SectionList section={section}/>
                        </Route>
                    );
                })}
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