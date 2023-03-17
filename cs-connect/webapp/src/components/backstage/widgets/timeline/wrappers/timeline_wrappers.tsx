import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {formatUrlWithId, useTimelineData} from 'src/hooks';
import {SectionContext} from 'src/components/rhs/rhs';

import ItemsTimeline from 'src/components/backstage/widgets/timeline/timeline';

const items = [
    {
        id: '1',
        label: '2022-03-14',
        text: 'An incident occurred',
    },
    {
        id: '2',
        label: '2022-03-14',
        text: 'Another incident occurred',
    },
    {
        id: '3',
        label: '2022-03-14',
        text: 'Incident solved',
    },
    {
        id: '4',
        label: '2022-03-14',
        text: 'Incident report',
    },
];

type Props = {
    name?: string;
    url?: string;
};

const TimelineWrapper = ({
    name = 'default',
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

    const data = useTimelineData(formatUrlWithId(url, sectionIdForUrl));

    return (
        <>
            {data &&
                <ItemsTimeline
                    data={data}
                    name={name}
                    sectionId={sectionIdForUrl}
                    parentId={parentId}
                />}
        </>
    );
};

export default TimelineWrapper;