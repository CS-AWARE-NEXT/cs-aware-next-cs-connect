import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {SectionContext} from 'src/components/rhs/rhs';
import Policy from 'src/components/backstage/widgets/policy/policy';
import {usePolicyTemplateData} from 'src/hooks';
import {formatUrlWithId} from 'src/helpers';

type Props = {
    name?: string;
    url?: string;
};

const PolicyWrapper = ({
    name = 'Policy',
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

    const sectionUrl = formatUrlWithId(url, sectionIdForUrl);
    const data = usePolicyTemplateData(sectionUrl);

    return (
        <>
            {data &&
                <Policy
                    data={data}
                    name={name}
                    sectionId={sectionIdForUrl}
                    parentId={parentId}
                    sectionUrl={sectionUrl}
                />}
        </>
    );
};

export default PolicyWrapper;