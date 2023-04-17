import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {DEFAULT_PATH, ORGANIZATIONS_PATH} from 'src/constants';
import {
    ReservedCategory,
    useEcosystem,
    useOrganizationsNoPageList,
    useReservedCategoryTitleMapper,
} from 'src/hooks';
import {LHSOrganizationDotMenu} from 'src/components/backstage/lhs/lhs_organization_dot_menu';
import {pluginUrl} from 'src/browser_routing';
import {ItemContainer, StyledNavLink} from 'src/components/sidebar/item';
import Sidebar, {SidebarGroup} from 'src/components/sidebar/sidebar';

const useLHSData = () => {
    const normalizeCategoryName = useReservedCategoryTitleMapper();
    const ecosystem = useEcosystem();
    const organizations = useOrganizationsNoPageList();
    if (!organizations || !ecosystem) {
        return {groups: [], ready: false};
    }

    const organizationsItems = organizations.map((o) => {
        const icon = 'icon-play-outline';
        const link = pluginUrl(`/${ORGANIZATIONS_PATH}/${o.id}?from=organizations_lhs`);

        return {
            areaLabel: o.name,
            display_name: o.name,
            id: o.id,
            icon,
            link,
            isCollapsed: false,
            itemMenu: (
                <LHSOrganizationDotMenu
                    organizationId={o.id}
                    organizationName={o.name}
                />),
            className: '',
        };
    });

    const organizationsWithoutEcosystem = organizationsItems.filter((group) => group.display_name !== ecosystem.name);
    const organizationsWithEcosystem = organizationsItems.filter((group) => group.display_name === ecosystem.name);
    const groups = [
        {
            collapsed: false,
            display_name: normalizeCategoryName(ReservedCategory.Ecosystem),
            id: ReservedCategory.Ecosystem,
            items: organizationsWithEcosystem,
        },
        {
            collapsed: false,
            display_name: normalizeCategoryName(ReservedCategory.Organizations),
            id: ReservedCategory.Organizations,
            items: organizationsWithoutEcosystem,
        },
    ];
    return {groups, ready: true};
};

const ViewAllOrganizations = () => {
    const {formatMessage} = useIntl();
    const viewAllMessage = formatMessage({defaultMessage: 'View all...'});
    return (
        <ItemContainer>
            <ViewAllNavLink
                id={'sidebarItem_view_all_organizations'}
                aria-label={formatMessage({defaultMessage: 'View all organizations'})}
                data-testid={'organizationsLHSButton'}
                to={`/${DEFAULT_PATH}/${ORGANIZATIONS_PATH}`}
                exact={true}
            >
                {viewAllMessage}
            </ViewAllNavLink>
        </ItemContainer>
    );
};

const addViewAllsToGroups = (groups: SidebarGroup[]) => {
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].id === ReservedCategory.Organizations) {
            groups[i].afterGroup = <ViewAllOrganizations/>;
        }
    }
};

const OrganizationsSidebar = () => {
    const teamID = useSelector(getCurrentTeamId);
    const {groups, ready} = useLHSData();

    if (!ready) {
        return (
            <Sidebar
                groups={[]}
                team_id={teamID}
            />
        );
    }

    addViewAllsToGroups(groups);

    return (
        <Sidebar
            groups={groups}
            team_id={teamID}
        />
    );
};

const ViewAllNavLink = styled(StyledNavLink)`
    &&& {
        &:not(.active) {
            color: rgba(var(--sidebar-text-rgb), 0.56);
        }

        padding-left: 23px;
    }
`;

export default OrganizationsSidebar;