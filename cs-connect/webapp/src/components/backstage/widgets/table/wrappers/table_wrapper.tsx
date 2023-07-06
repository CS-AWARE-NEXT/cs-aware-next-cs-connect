import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {useTableData, useUrlHash} from 'src/hooks';
import {formatName, formatUrlWithId} from 'src/helpers';
import {SectionContext} from 'src/components/rhs/rhs';
import Table from 'src/components/backstage/widgets/table/table';

type Props = {
    name?: string;
    url?: string;
};

const TableWrapper = ({
    name = 'default',
    url = '',
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {search} = useLocation();

    // TODO: move to widget
    const urlHash = useUrlHash();

    const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;
    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    const data = useTableData(formatUrlWithId(url, sectionIdForUrl));

    return (
        <Table
            id={formatName(name)}
            data={data}
            name={name}
            sectionId={sectionIdForUrl}
            parentId={parentId}
            urlHash={urlHash}
        />
    );
};

export default TableWrapper;