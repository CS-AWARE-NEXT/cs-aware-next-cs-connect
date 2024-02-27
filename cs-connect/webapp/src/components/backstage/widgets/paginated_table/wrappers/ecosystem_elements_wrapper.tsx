import React, {useEffect, useState} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {buildQuery, getSection, useSection} from 'src/hooks';
import {
    formatName,
    formatSectionPath,
    formatStringToCapitalize,
    removeSectionNameFromPath,
} from 'src/helpers';
import {StepValue} from 'src/types/steps_modal';
import {PaginatedTableData, PaginatedTableRow, WITH_SORTER} from 'src/types/paginated_table';
import {navigateToUrl} from 'src/browser_routing';
import {PARENT_ID_PARAM, ecosystemElementsFields, ecosystemElementsWidget} from 'src/constants';
import PaginatedTable, {fillColumn, fillRow} from 'src/components/backstage/widgets/paginated_table/paginated_table';
import Empty from 'src/components/backstage/widgets/empty/empty';
import {getOrganizationById} from 'src/config/config';

type Props = {
    name?: string;
    elements?: StepValue[];
};

const EcosystemElementsWrapper = ({
    name = formatStringToCapitalize(ecosystemElementsWidget),
    elements = [],
}: Props) => {
    const {path, url, params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {search} = useLocation();
    const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
    const parentId = queryParams.parentId as string;

    const section = useSection(parentId);
    const [data, setData] = useState<PaginatedTableData>({columns: [], rows: []});
    useEffect(() => {
        const rows = elements ? elements.map((element) => {
            const parentSection = getSection(element.parentId);

            // parentSection not found because it has been deleted
            // we will filter rows with empty id after this map, in the filter function
            if (!parentSection) {
                return {id: ''};
            }
            const pathWithoutSectionName = removeSectionNameFromPath(path, formatName(section.name));
            const basePath = `${formatSectionPath(pathWithoutSectionName, element.organizationId)}/${formatName(parentSection.name)}`;
            const row: PaginatedTableRow = {
                id: element.id,
                organization: getOrganizationById(element.organizationId).name,
                name: element.name,
                description: element.description,
            };
            return {
                ...fillRow(row, '', url, buildQuery(parentId, sectionId)),
                onClick: () => navigateToUrl(`${basePath}/${element.id}?${PARENT_ID_PARAM}=${element.parentId}`),
            };
        }).filter((row) => row.id !== '') : [];
        const columns = ecosystemElementsFields.map((field) => {
            return fillColumn(field, WITH_SORTER);
        });
        setData({columns, rows});
    }, [elements]);

    return (
        <>
            {(data.columns.length > 0 && data.rows.length > 0) ?
                <PaginatedTable
                    data={data}
                    id={formatName(name)}
                    name={name}
                    sectionId={sectionId}
                    parentId={parentId}
                    pointer={true}
                /> :
                <Empty
                    name={name}
                    sectionId={sectionId}
                    parentId={parentId}
                />}
        </>
    );
};

export default EcosystemElementsWrapper;