import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {SectionContext} from 'src/components/rhs/rhs';
import Agora from 'src/components/backstage/widgets/agora/agora';

type Props = {
    name?: string;
    url?: string;
    sectionParentId?: string;
    singleLink?: boolean;
};

const CustomViewAgoraWrapper = ({
    name = '',
    url = '',
    sectionParentId = '',
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const location = useLocation();
    const queryParams = qs.parse(location.search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    const data = {};

    return (
        <Agora
            data={data}
            name={name}
            url={url}
            sectionId={sectionIdForUrl}
            parentId={sectionParentId ?? parentId}
        />
    );
};

export default CustomViewAgoraWrapper;