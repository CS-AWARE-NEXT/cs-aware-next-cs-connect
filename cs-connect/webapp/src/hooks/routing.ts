import {GlobalState} from '@mattermost/types/store';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {useEffect} from 'react';
import {useSelector} from 'react-redux';

const selectSiteName = (state: GlobalState): string | undefined => getConfig(state).SiteName;

export const useForceDocumentTitle = (title: string): void => {
    const siteName = useSelector(selectSiteName);

    // Restore original title
    useEffect(() => {
        const original = document.title;
        return () => {
            document.title = original;
        };
    }, []);

    // Update title
    useEffect(() => {
        document.title = title + ' - ' + siteName;
    }, [title, siteName]);
};

export const useNavHighlighting = (
    navItem: string,
    navItemActive: string,
    navText: string,
    deps: any[],
): void => {
    useEffect(() => {
        const navItems = document.getElementsByClassName(navItem) as HTMLCollectionOf<HTMLElement>;
        let currentNavItem: HTMLElement;
        for (let i = 0; i < navItems.length; i++) {
            currentNavItem = navItems[i];
            const isCurrentNavItem = currentNavItem.innerText === navText;
            if (isCurrentNavItem) {
                currentNavItem.classList.add(navItemActive);
                break;
            }
        }
        return () => {
            let isAnotherNavItemActive = false;
            for (let i = 0; i < navItems.length; i++) {
                const isNotCurrentNavItem = navItems[i].innerText !== currentNavItem.innerText;
                const isNextCurrentNavItem = navItems[i].classList.contains(navItemActive);
                if (isNotCurrentNavItem && isNextCurrentNavItem) {
                    isAnotherNavItemActive = true;
                    break;
                }
            }
            if (isAnotherNavItemActive && currentNavItem) {
                currentNavItem.classList.remove(navItemActive);
            }
        };
    }, deps);
};