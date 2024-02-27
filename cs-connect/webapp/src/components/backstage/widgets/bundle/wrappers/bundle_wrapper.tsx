import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {SectionContext} from 'src/components/rhs/rhs';
import {useBundleData} from 'src/hooks';
import {formatUrlWithId} from 'src/helpers';
import Bundle from 'src/components/backstage/widgets/bundle/bundle';

type Props = {
    name?: string;
    url?: string;
};

const BundleWrapper = ({
    name = 'Bundle',
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

    const data = useBundleData(formatUrlWithId(url, sectionIdForUrl));

    return (
        <>
            {data &&
                <Bundle
                    data={data}
                    name={name}
                    sectionId={sectionIdForUrl}
                    parentId={parentId}
                />}
        </>
    );
};

export default BundleWrapper;