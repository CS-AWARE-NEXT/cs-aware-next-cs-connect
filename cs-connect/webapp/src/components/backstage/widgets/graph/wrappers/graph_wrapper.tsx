import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {FullUrlContext, SectionContext} from 'src/components/rhs/rhs';
import {useGraphData} from 'src/hooks';
import {formatUrlWithId} from 'src/helpers';
import Graph from 'src/components/backstage/widgets/graph/graph';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';

type Props = {
    name?: string;
    url?: string;
};

const GraphWrapper = ({
    name = 'default',
    url = '',
}: Props) => {
    const fullUrl = useContext(FullUrlContext);
    const sectionContextOptions = useContext(SectionContext);
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);

    const {url: routeUrl, params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {hash: urlHash, search} = useLocation();

    const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;
    const isFullUrlProvided = fullUrl !== '';
    const sectionUrl = isFullUrlProvided ? fullUrl : routeUrl;

    const graphUrl = formatUrlWithId(url, sectionIdForUrl);
    const data = useGraphData(graphUrl, urlHash, {
        applyOptions: !isEcosystemRhs,
        parentId,
        sectionId: sectionIdForUrl,
        sectionUrl,
    });

    return (
        <Graph
            data={data}
            name={name}
            sectionId={sectionIdForUrl}
            parentId={parentId}
        />
    );
};

export default GraphWrapper;