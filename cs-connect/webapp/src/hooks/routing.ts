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
