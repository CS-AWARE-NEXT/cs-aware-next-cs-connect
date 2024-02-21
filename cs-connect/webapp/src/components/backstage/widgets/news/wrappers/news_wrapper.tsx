import React, {useContext, useState} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {SectionContext} from 'src/components/rhs/rhs';
import News from 'src/components/backstage/widgets/news/news';
import {NewsQuery} from 'src/types/news';
import {useNewsPostData} from 'src/hooks';

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

    const data = useNewsPostData(url, query);

    return (
        <>
            {data &&
                <News
                    data={data}
                    name={name}
                    query={query}
                    setQuery={setQuery}
                    sectionId={sectionIdForUrl}
                    parentId={parentId}
                />}
        </>
    );
};

export default NewsWrapper;