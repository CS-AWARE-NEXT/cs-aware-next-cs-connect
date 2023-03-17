import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import qs from 'qs';
import {useSelector} from 'react-redux';

import {SectionContext} from 'src/components/rhs/rhs';
import SingleChannel from 'src/components/backstage/widgets/single_channel/single_channel';

const SingleChannelWrapper = () => {
    const sectionContextOptions = useContext(SectionContext);
    const {params} = useRouteMatch<{sectionId: string}>();
    const location = useLocation();
    const queryParams = qs.parse(location.search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;
    const teamId = useSelector(getCurrentTeamId);

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionId = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : params.sectionId;

    return (
        <SingleChannel
            parentId={parentId}
            sectionId={sectionId}
            teamId={teamId}
        />
    );
};

export default SingleChannelWrapper;