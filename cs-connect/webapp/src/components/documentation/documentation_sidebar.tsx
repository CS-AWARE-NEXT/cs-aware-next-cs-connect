import React, {useEffect} from 'react';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {useSelector} from 'react-redux';
import {useLocation} from 'react-router-dom';

import {buildMap, useReservedCategoryTitleMapper} from 'src/hooks';
import Sidebar from 'src/components/sidebar/sidebar';
import {pluginUrl} from 'src/browser_routing';
import {DOCUMENTATION_PATH} from 'src/constants';

const idsMap = buildMap([
    {key: 'about', value: {id: 'about-the-platform', name: 'About the platform'}},
    {key: 'mechanism', value: {id: 'hyperlinking-mechanism', name: 'Hyperlinking Mechanism'}},
]);

const useLHSData = () => {
    const {hash: urlHash} = useLocation();
    const normalizeCategoryName = useReservedCategoryTitleMapper();
    const icon = 'icon-play-outline';

    // TODO: use the same mechanism as the rhs to remove the active class
    // when the group is closed and opened the items become all active
    // by detecting the change in class you can remove the active class
    // to all items without the id equals to the hash
    useEffect(() => {
        idsMap.forEach(({id}, _) => {
            const item = document.getElementById(`sidebarItem_${id}`) as HTMLElement;
            item.classList.remove('active');
            if (urlHash === `#${id}`) {
                item.classList.add('active');
            }
        });
    }, [urlHash]);

    const documentationItems = Array.from(idsMap.values()).map(({id, name}) => ({
        areaLabel: name,
        display_name: name,
        id,
        icon,
        link: pluginUrl(`/${DOCUMENTATION_PATH}#${id}`),
        isCollapsed: false,
        className: '',
    }));

    const groups = [
        {
            collapsed: false,
            display_name: 'Documentation',
            id: 'Documentation',
            items: documentationItems,
        },
    ];
    return {groups, ready: true};
};

const DocumentationSidebar = () => {
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

    return (
        <Sidebar
            groups={groups}
            team_id={teamID}
        />
    );
};

export default DocumentationSidebar;