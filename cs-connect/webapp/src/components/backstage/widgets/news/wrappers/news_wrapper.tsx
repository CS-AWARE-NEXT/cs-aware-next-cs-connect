import React, {useContext, useState} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import News from 'src/components/backstage/widgets/news/news';
import {NewsQuery} from 'src/types/news';
import {SectionContext} from 'src/components/rhs/rhs';
import {formatUrlWithId} from 'src/helpers';
import {useNewsPostData, useSectionInfo} from 'src/hooks';
import {getSectionById} from 'src/config/config';

type Props = {
    name?: string;
    url?: string;
};

const NewsWrapper = ({
    name = 'News',
    url = '',
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const location = useLocation();
    const queryParams = qs.parse(location.search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    const [query, setQuery] = useState<NewsQuery>({
        search: '',
        offset: '0',
        limit: '10',
    });

    const parent = getSectionById(parentId);
    const sectionInfo = useSectionInfo(sectionIdForUrl, parent.url);

    // console.log('NewsWrapper',
    //     'sectionIdForUrl', sectionIdForUrl,
    //     'sectionInfo', sectionInfo,
    //     'parentId', parentId,
    //     'parent', {parent});

    const data = useNewsPostData(formatUrlWithId(url, sectionIdForUrl), query);
    const todayData = useNewsPostData(formatUrlWithId(url, sectionIdForUrl), {
        search: 'today',
        offset: '0',
        limit: '10',
        orderBy: 'observation_created',
        direction: 'desc',
    });

    const isToday = Boolean(sectionInfo) && Boolean(parent) && Boolean(parent.name) &&
        parent.name.toLowerCase().includes('agora') && sectionInfo.name === 'Todays Latest News';
    const newsData = isToday ? todayData : data;
    const introText = isToday ? 'Enjoy Today\'s Latest News.' : '';

    return (
        <>
            {data &&
                <News
                    data={newsData}
                    name={name}
                    query={query}
                    setQuery={setQuery}
                    sectionId={sectionIdForUrl}
                    parentId={parentId}
                    noSearchBar={isToday}
                    noTotalCount={isToday}
                    introText={introText}
                />}
        </>
    );
};

export default NewsWrapper;