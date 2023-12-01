import React, {useContext, useState} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';
import {ReactFlowProvider} from 'reactflow';

import {FullUrlContext, SectionContext} from 'src/components/rhs/rhs';
import {useGraphData, useUrlHash} from 'src/hooks';
import {formatUrlWithId} from 'src/helpers';
import Graph, {getLayoutedElements} from 'src/components/backstage/widgets/graph/graph';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {Direction, GraphDirection} from 'src/types/graph';

type Props = {
    name?: string;
    url?: string;
};

const GraphWrapper = ({
    name = 'Graph',
    url = '',
}: Props) => {
    const fullUrl = useContext(FullUrlContext);
    const sectionContextOptions = useContext(SectionContext);
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);

    const {url: routeUrl, params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {search} = useLocation();
    const urlHash = useUrlHash();

    const [direction, setDirection] = useState<GraphDirection>(Direction.VERTICAL);

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

    const {nodes, edges} = getLayoutedElements(data.nodes, data.edges, direction);
    return (
        <ReactFlowProvider>
            <Graph
                data={{...data, nodes, edges}}
                direction={direction}
                name={name}
                sectionId={sectionIdForUrl}
                parentId={parentId}
                setDirection={setDirection}
            />
        </ReactFlowProvider>
    );
};

export default GraphWrapper;
