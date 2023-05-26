import React, {useContext, useEffect, useState} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';
import {Tag} from 'antd';

// import {Client4} from 'mattermost-webapp/packages/mattermost-redux/src/client';

import {buildQuery} from 'src/hooks';
import {formatName, formatStringToCapitalize} from 'src/helpers';
import {PaginatedTableData, PaginatedTableRow} from 'src/types/paginated_table';
import {ecosystemRolesFields, ecosystemRolesWidget} from 'src/constants';
import PaginatedTable, {fillColumn, fillRow} from 'src/components/backstage/widgets/paginated_table/paginated_table';
import {Role} from 'src/types/scenario_wizard';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext, SectionContext} from 'src/components/rhs/rhs';

const {CheckableTag} = Tag;

type Props = {
    name?: string;
    roles?: Role[];
};

const EcosystemRolesWrapper = ({
    name = formatStringToCapitalize(ecosystemRolesWidget),
    roles = [],
}: Props) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const sectionContextOptions = useContext(SectionContext);

    const {url, params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {search} = useLocation();
    const queryParams = qs.parse(search, {ignoreQueryPrefix: true});

    const parentIdParam = queryParams.parentId as string;
    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    const [data, setData] = useState<PaginatedTableData>({columns: [], rows: []});

    useEffect(() => {
        const rows = roles ? roles.map((role) => {
            // const user = await Client4.getUser(role.userId);
            const row: PaginatedTableRow = {
                id: role.id,
                name: role.userId,
                user: role.userId,
                roles: role.roles,
            };
            const query = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);
            const rowUrl = fullUrl || url;
            return fillRow(row, '', rowUrl, query);
        }) : [];
        const columns = ecosystemRolesFields.map((field) => {
            const column = fillColumn(field);
            if (column.key !== 'roles') {
                return column;
            }
            return {
                ...column,
                render: (text: string, record: PaginatedTableRow) => (
                    <>
                        {record.roles.map((role: string) => (
                            <CheckableTag
                                key={role}
                                checked={true}
                            >
                                {role}
                            </CheckableTag>))}
                    </>
                ),
            };
        });
        setData({columns, rows});
    }, [roles]);

    return (
        <>
            {(data.columns.length > 0 && data.rows.length > 0) &&
                <PaginatedTable
                    data={data}
                    id={formatName(name)}
                    name={name}
                    sectionId={sectionIdForUrl}
                    parentId={parentId}
                />}
        </>
    );
};

export default EcosystemRolesWrapper;