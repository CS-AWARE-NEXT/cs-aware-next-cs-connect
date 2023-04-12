import {Section} from 'src/types/organization';
import {getOrganizations} from 'src/config/config';
import {estimatedOptionsLoadTime} from 'src/constants';

import {formatStringToLowerCase} from './format';

export const getSection = (id: string): Section => {
    return getOrganizations().
        map((o) => o.sections).
        flat().
        filter((s: Section) => s.id === id)[0];
};

export const hideOptions = (): NodeJS.Timeout[][] => {
    (document.getElementsByClassName('AddChannelDropdown_dropdownButton')[0] as HTMLElement).style.display = 'none';

    const interval = setInterval(() => {
        const indicator = document.getElementById('unreadIndicatorTop');
        if (indicator) {
            indicator.style.display = 'none';
        }

        const groups = document.getElementsByClassName('SidebarChannelGroup a11y__section') as HTMLCollectionOf<HTMLElement>;
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            if (formatStringToLowerCase(group.innerText).includes('direct messages')) {
                group.style.display = 'none';
                break;
            }
        }

        const townSquare = document.getElementById('sidebarItem_town-square')?.parentElement;
        if (townSquare) {
            townSquare.style.display = 'none';
        }
        const offTopic = document.getElementById('sidebarItem_off-topic')?.parentElement;
        if (offTopic) {
            offTopic.style.display = 'none';
        }
    }, estimatedOptionsLoadTime);

    return [[], [interval]];
};

