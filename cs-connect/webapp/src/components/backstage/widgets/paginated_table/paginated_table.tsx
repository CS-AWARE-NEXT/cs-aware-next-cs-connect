import {Collapse, Input, Table} from 'antd';
import React, {
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {useLocation, useRouteMatch} from 'react-router-dom';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import CopyLink from 'src/components/commons/copy_link';
import {PaginatedTableColumn, PaginatedTableData, PaginatedTableRow} from 'src/types/paginated_table';
import {
    buildIdForUrlHashReference,
    buildQuery,
    buildTo,
    buildToForCopy,
    isReferencedByUrlHash,
    useUrlHash,
} from 'src/hooks';
import {
    formatName,
    formatPropertyName,
    formatSectionPath,
    formatStringToCapitalize,
    formatStringToLowerCase,
} from 'src/helpers';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {navigateToUrl} from 'src/browser_routing';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import {PARENT_ID_PARAM} from 'src/constants';
import {saveSectionInfo} from 'src/clients';
import {SectionUrlContext} from 'src/components/backstage/sections/section_list';

import RowInputFields from './row_input_fields';

type Props = {
    data: PaginatedTableData;
    id: string;
    internal?: boolean;
    isSection?: boolean;
    name: string;
    parentId: string;
    pointer?: boolean;
    sectionId?: string;
};

const {Panel} = Collapse;

const ROW_PER_PAGE = 10;

const iconColumn: PaginatedTableColumn = {
    title: '',
    dataIndex: 'icon',
    key: 'icon',
    width: '0px',
    render: (text: string, record: PaginatedTableRow) => (
        <CopyLink
            id={record.itemId}
            text={record.name}
            to={buildToForCopy(record.to)}
            name={record.name}
            area-hidden={true}
            iconWidth={'1.45em'}
            iconHeight={'1.45em'}
        />
    ),
};

export const fillColumn = (title: string, sortable: boolean | undefined): PaginatedTableColumn => {
    const formattedTitle = formatPropertyName(title);
    const column = {
        title,
        dataIndex: formattedTitle,
        key: formattedTitle,
    };
    const sortableColumn = {
        ...column,
        sorter: (a: PaginatedTableRow, b: PaginatedTableRow) => {
            const aValue = a[formattedTitle];
            const bValue = b[formattedTitle];
            if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
                return Number(aValue) - Number(bValue);
            }
            return aValue.localeCompare(bValue);
        },
    };
    return sortable ? sortableColumn : column;
};

export const fillRow = (
    row: PaginatedTableRow,
    fullUrl: string,
    routeUrl: string,
    query: string,
): PaginatedTableRow => {
    const itemId = buildIdForUrlHashReference('paginated-table-row', row.id);
    return {
        ...row,
        key: row.id,
        itemId,
        to: buildTo(fullUrl, itemId, query, routeUrl),
    };
};

const PaginatedTable = ({
    data,
    id,
    internal = false,
    isSection = false,
    name,
    parentId,
    pointer = false,
    sectionId,
}: Props) => {
    const {formatMessage} = useIntl();
    const {path} = useRouteMatch();

    const fullUrl = useContext(FullUrlContext);
    const sectionUrl = useContext(SectionUrlContext);
    const organizationId = useContext(OrganizationIdContext);

    const [searchText, setSearchText] = useState('');
    const [filteredRows, setFilteredRows] = useState<PaginatedTableRow[]>(data.rows);

    useEffect(() => {
        setFilteredRows(data.rows || []);
    }, [data.rows]);

    const formatColumnNames = useCallback(() => {
        return data.columns.map((column) => ({...column, title: formatStringToCapitalize(column.title)}));
    }, []);
    const formattedColumns = formatColumnNames();

    const handleSearch = (value: string) => {
        const filtered = data.rows.filter((record: PaginatedTableRow) => {
            const recordName = formatStringToLowerCase(record.name);
            return recordName.includes(formatStringToLowerCase(value));
        });
        setSearchText(value);
        setFilteredRows(filtered);
    };

    const handleCreateRow = (row: PaginatedTableRow) => {
        saveSectionInfo(row, sectionUrl).
            then((result) => {
                const basePath = `${formatSectionPath(path, organizationId)}/${formatName(name)}`;
                navigateToUrl(`${basePath}/${result.id}?${PARENT_ID_PARAM}=${parentId}`);
            }).
            catch(() => {
                // TODO: Do something in case of error
            });

        // In case you'd want to add the row, instead of redirect to it
        // setFilteredRows([...filteredRows, row]);
    };

    const paginatedTableIdPrefix = sectionId ? `${id}-${sectionId}-${parentId}` : `${id}-${parentId}`;
    const paginatedTableId = isSection ? `${paginatedTableIdPrefix}-section` : `${paginatedTableIdPrefix}-widget`;

    const [currentPage, setCurrentPage] = useState<number>(1);

    const urlHash = useUrlHash();
    const {hash} = useLocation();
    useEffect(() => {
        if (!urlHash || !urlHash.startsWith('#paginated-table-row-')) {
            return;
        }
        if (!data) {
            // Fixes when sidebar is closed and posts are not loaded yet
            return;
        }
        const index = data.rows.findIndex((row) => urlHash.includes(`${row.id}`));
        if (index < 0) {
            return;
        }
        const current = Math.ceil((index + 1) / ROW_PER_PAGE);
        setCurrentPage(current);
    }, [urlHash, hash, data]);

    return (
        <Container
            id={paginatedTableId}
            data-testid={paginatedTableId}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={paginatedTableId}
                    query={buildQuery(parentId, sectionId)}
                    text={name}
                    title={name}
                />
            </Header>
            {(filteredRows.length < 1 && searchText === '') &&
                <Table
                    id={paginatedTableId}
                    dataSource={[]}
                    columns={formattedColumns}
                    rowKey='key'
                    size='middle'
                />}
            {(filteredRows.length > 0 || searchText !== '') &&
                <>
                    <TableSearch
                        placeholder='Search by name'
                        value={searchText}
                        onChange={({target}) => handleSearch(target.value)}
                    />
                    <StyledTable
                        id={paginatedTableId}
                        dataSource={filteredRows}
                        columns={[iconColumn, ...formattedColumns]}
                        components={{
                            body: {
                                row: TableRow,
                            },
                        }}
                        onRow={(record: PaginatedTableRow) => {
                            return {
                                onClick: record.onClick ? record.onClick : undefined,
                                pointer,
                                record,
                            };
                        }}
                        pagination={{
                            current: currentPage,
                            onChange: (page) => setCurrentPage(page),
                            pageSize: ROW_PER_PAGE,
                        }}
                        rowKey='key'
                        size='middle'
                    />
                </>}
            {internal &&
                <Collapse>
                    <TablePanel
                        header={formatMessage({defaultMessage: 'Create New'})}
                        key='add-new-row'
                    >
                        <RowInputFields
                            columns={data.columns}
                            createRow={handleCreateRow}
                        />
                    </TablePanel>
                </Collapse>}
        </Container>
    );
};

const StyledTable = styled(Table)`
`;

const TablePanel = styled(Panel)`
    background: var(--center-channel-bg) !important;

    .ant-collapse-header {
        color: rgba(var(--center-channel-color-rgb), 0.90) !important;
    }
`;

const TableRow = (props: any) => {
    const urlHash = useUrlHash();
    const {pointer, record} = props;
    return (
        <TableRowItem
            id={buildIdForUrlHashReference('paginated-table-row', record?.id)}
            isUrlHashed={isReferencedByUrlHash(urlHash, buildIdForUrlHashReference('paginated-table-row', record?.id))}
            pointer={pointer}
            {...props}
        >
            {props.children}
        </TableRowItem>
    );
};

const TableRowItem = styled.tr<{isUrlHashed?: boolean, pointer: boolean}>`
    cursor: ${(props) => (props.pointer ? 'pointer' : 'auto')};
    color: rgba(var(--center-channel-color-rgb), 0.90);
    background: ${(props) => (props.isUrlHashed ? 'rgb(244, 180, 0)' : 'var(--center-channel-bg)')};
    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.04) !important;
    }
    ${CopyLink} {
        margin-left: -1.25em;
        opacity: 1;
        transition: opacity ease 0.15s;
    }
    &:not(:hover) ${CopyLink}:not(:hover) {
        opacity: 0;
    }
`;

const TableSearch = styled(Input.Search)`
    margin-bottom: 6px;
    width: 50%;
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default PaginatedTable;
