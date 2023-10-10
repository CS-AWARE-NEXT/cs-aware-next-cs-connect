import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {SectionContext} from 'src/components/rhs/rhs';
import SocialMediaPosts from 'src/components/backstage/widgets/social_media_posts/social_media_posts';
import {usePostData} from 'src/hooks';
import {formatUrlWithId} from 'src/helpers';

type Props = {
    name?: string;
    url?: string;
};

const SocialMediaPostsWrapper = ({
    name = 'Posts',
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

    const data = usePostData(formatUrlWithId(url, sectionIdForUrl));

    return (
        <SocialMediaPosts
            data={data.items}
            name={name}
            sectionId={sectionIdForUrl}
            parentId={parentId}
        />
    );
};

export default SocialMediaPostsWrapper;