import React, {useContext, useState} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {useLinkListData} from 'src/hooks';
import {SectionContext} from 'src/components/rhs/rhs';
import LinkList from 'src/components/backstage/widgets/link_list/link_list';

type Props = {
    name?: string;
    url?: string;
    sectionParentId?: string;
    singleLink?: boolean;
};

const CustomViewLinkListWrapper = ({
    name = '',
    url = '',
    sectionParentId = '',
    singleLink = false,
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const location = useLocation();
    const queryParams = qs.parse(location.search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    // const data = {items: []};
    const [refresh, forceRefresh] = useState<boolean>(false);
    const data = useLinkListData(url, refresh);

    return (
        <LinkList
            data={data}
            name={name}
            url={url}
            sectionId={sectionIdForUrl}
            parentId={sectionParentId ?? parentId}
            forceRefresh={forceRefresh}
            singleLink={singleLink}
        />
    );
};

export default CustomViewLinkListWrapper;