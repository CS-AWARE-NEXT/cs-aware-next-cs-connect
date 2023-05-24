import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {formatStringToCapitalize} from 'src/helpers';
import {SectionContext} from 'src/components/rhs/rhs';
import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {ecosystemObjectivesWidget} from 'src/constants';

type Props = {
    name?: string;
    objectives: string;
};

const EcosystemObjectivesWrapper = ({
    name = formatStringToCapitalize(ecosystemObjectivesWidget),
    objectives,
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const location = useLocation();
    const queryParams = qs.parse(location.search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    return (
        <TextBox
            name={name}
            parentId={parentId}
            sectionId={sectionIdForUrl}
            text={objectives}
        />
    );
};

export default EcosystemObjectivesWrapper;