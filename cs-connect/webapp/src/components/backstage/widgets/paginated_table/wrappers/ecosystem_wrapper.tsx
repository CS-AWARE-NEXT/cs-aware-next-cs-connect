import React, {useEffect, useState} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {
    buildQuery,
    formatName,
    formatSectionPath,
    formatStringToLowerCase,
    getSection,
    removeSectionNameFromPath,
    useSection,
} from 'src/hooks';
import {StepValue} from 'src/types/steps_modal';
import {PaginatedTableData, PaginatedTableRow} from 'src/types/paginated_table';
import {navigateToUrl} from 'src/browser_routing';
import {PARENT_ID_PARAM, ecosystemDefaultFields} from 'src/constants';
import PaginatedTable, {fillColumn, fillRow} from 'src/components/backstage/widgets/paginated_table/paginated_table';

type Props = {
    name?: string;
    elements?: StepValue[];
};

const EcosystemPaginatedTableWrapper = ({
    name = 'Issue Elements',
    elements = [],
}: Props) => {
    const {path, url, params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {search} = useLocation();
    const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
    const parentId = queryParams.parentId as string;

    const section = useSection(parentId);
    const [data, setData] = useState<PaginatedTableData>({columns: [], rows: []});
    useEffect(() => {
        const rows = elements.map((element) => {
            const parentSection = getSection(element.parentId);
            const pathWithoutSectionName = removeSectionNameFromPath(path, section.name);
            const basePath = `${formatSectionPath(pathWithoutSectionName, element.organizationId)}/${formatStringToLowerCase(parentSection.name)}`;
            const row: PaginatedTableRow = {
                id: element.id,
                name: element.name,
                description: element.description,
            };
            return {
                ...fillRow(row, '', url, buildQuery(parentId, sectionId)),
                onClick: () => navigateToUrl(`${basePath}/${element.id}?${PARENT_ID_PARAM}=${element.parentId}`),
            };
        });
        const columns = ecosystemDefaultFields.map((field) => {
            return fillColumn(field);
        });
        setData({columns, rows});
    }, [elements]);

    return (
        <>
            {(data.columns.length > 0 && data.rows.length > 0) &&
                <PaginatedTable
                    data={data}
                    id={formatName(name)}
                    isSection={true}
                    name={name}
                    sectionId={sectionId}
                    parentId={parentId}
                    pointer={true}
                />}
        </>
    );
};

export default EcosystemPaginatedTableWrapper;