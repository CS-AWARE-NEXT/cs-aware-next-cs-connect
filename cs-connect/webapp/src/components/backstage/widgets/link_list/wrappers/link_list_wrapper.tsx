import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

// import {useListData} from 'src/hooks';
// import {formatUrlWithId} from 'src/helpers';
import {SectionContext} from 'src/components/rhs/rhs';
import LinkList from 'src/components/backstage/widgets/link_list/link_list';

type Props = {
    name?: string;
    url?: string;
};

const LinkListWrapper = ({
    name = '',
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

    // const data = useListData(formatUrlWithId(url, sectionIdForUrl));
    const data = {items: []};

    return (
        <LinkList
            data={data}
            name={name}
            sectionId={sectionIdForUrl}
            parentId={parentId}
        />
    );
};

export default LinkListWrapper;