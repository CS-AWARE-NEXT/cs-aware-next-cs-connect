import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {usePlaybookData} from 'src/hooks';
import {formatUrlWithId} from 'src/helpers';
import {SectionContext} from 'src/components/rhs/rhs';
import CacaoPlaybook from 'src/components/backstage/widgets/cacao_playbook/playbook';

type Props = {
    name?: string;
    url?: string;
};

const CacaoPlaybookWrapper = ({
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

    const data = usePlaybookData(formatUrlWithId(url, sectionIdForUrl));

    return (
        <CacaoPlaybook
            data={data}
            name={name}
            sectionId={sectionIdForUrl}
            parentId={parentId}
        />
    );
};

export default CacaoPlaybookWrapper;