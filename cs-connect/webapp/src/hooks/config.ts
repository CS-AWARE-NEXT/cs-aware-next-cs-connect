import {useEffect} from 'react';

import {Section, ShowOptionsConfig} from 'src/types/organization';
import {getOrganizations} from 'src/config/config';
import {estimatedOptionsLoadTime} from 'src/constants';

import {formatStringToLowerCase} from 'src/helpers';

export const useHideOptions = (showOptionsConfig: ShowOptionsConfig) => {
    useEffect(() => {
        const [timeouts, intervals] = hideOptions(showOptionsConfig);
        return () => {
            timeouts.forEach((timeout) => clearTimeout(timeout));
            intervals.forEach((interval) => clearInterval(interval));
        };
    });
};

const hideOptions = (showOptionsConfig: ShowOptionsConfig): NodeJS.Timeout[][] => {
    if (!showOptionsConfig.showAddChannelButton) {
        (document.getElementsByClassName('AddChannelDropdown_dropdownButton')[0] as HTMLElement).style.display = 'none';
    }
    const hiddenIconBox = document.getElementById('hidden-icon')?.parentElement?.parentElement;
    if (hiddenIconBox) {
        hiddenIconBox.style.display = 'none';
    }

    const interval = setInterval(() => {
        if (!showOptionsConfig.showUnreadIndicator) {
            const indicator = document.getElementById('unreadIndicatorTop');
            if (indicator) {
                indicator.style.display = 'none';
            }
        }

        if (!showOptionsConfig.showDirectMessages) {
            const groups = document.getElementsByClassName('SidebarChannelGroup a11y__section') as HTMLCollectionOf<HTMLElement>;
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                const groupInnerText = formatStringToLowerCase(group.innerText);

                // TODO: this check has to be made based on locale
                if (groupInnerText.includes('direct messages') || groupInnerText.includes('messaggi diretti')) {
                    group.style.display = 'none';
                    break;
                }
            }
        }
        if (!showOptionsConfig.showDefaultChannels) {
            const townSquare = document.getElementById('sidebarItem_town-square')?.parentElement;
            if (townSquare) {
                townSquare.style.display = 'none';
            }
        }

        // TODO: this has to be removed server-side
        const offTopic = document.getElementById('sidebarItem_off-topic')?.parentElement;
        if (offTopic) {
            offTopic.style.display = 'none';
        }
        const openDirectMessageMenuItem = document.getElementById('openDirectMessageMenuItem');
        if (openDirectMessageMenuItem) {
            openDirectMessageMenuItem.style.display = 'none';
        }
    }, estimatedOptionsLoadTime);

    return [[], [interval]];
};

export const getSection = (id: string): Section => {
    return getOrganizations().
        map((o) => o.sections).
        flat().
        filter((s: Section) => s.id === id)[0];
};

export const isSectionByName = (name: string): boolean => {
    return getOrganizations().
        map((o) => o.sections).
        flat().
        some((s: Section) => s.name === name);
};

