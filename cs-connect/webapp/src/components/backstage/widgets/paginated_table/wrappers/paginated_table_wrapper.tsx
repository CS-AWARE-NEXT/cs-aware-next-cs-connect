import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {buildQuery, usePaginatedTableData} from 'src/hooks';
import {formatName, formatUrlWithId} from 'src/helpers';
import {SectionContext} from 'src/components/rhs/rhs';
import PaginatedTable from 'src/components/backstage/widgets/paginated_table/paginated_table';

type Props = {
    name?: string;
    url?: string;
};

const PaginatedTableWrapper = ({
    name = 'default',
    url = '',
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {search} = useLocation();

    const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;
    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    const data = usePaginatedTableData(formatUrlWithId(url, sectionIdForUrl), buildQuery(parentId, sectionIdForUrl));

    return (
        <PaginatedTable
            id={formatName(name)}
            data={data}
            name={name}
            sectionId={sectionIdForUrl}
            parentId={parentId}
        />
    );
};

export default PaginatedTableWrapper;