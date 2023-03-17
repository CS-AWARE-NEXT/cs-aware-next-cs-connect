import React, {useContext} from 'react';
import styled from 'styled-components';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {TableData} from 'src/types/table';
import {buildQuery} from 'src/hooks';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';

import TableHeader from './table_header';
import TableRow from './table_row';

type Props = {
    data: TableData;
    id: string;
    isSection?: boolean;
    name: string;
    open?: (resourceId: string) => void;
    parentId: string;
    pointer?: boolean;
    sectionId?: string;
    urlHash: string;
};

const Table = ({
    data,
    id,
    isSection = false,
    name,
    open,
    parentId,
    pointer = false,
    sectionId,
    urlHash,
}: Props) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const {caption, headers, rows} = data;
    const tableIdPrefix = `${id}-${sectionId}-${parentId}`;
    const tableId = isSection ? `${tableIdPrefix}-section` : `${tableIdPrefix}-widget`;

    const query = buildQuery(parentId, sectionId);

    return (
        <Container
            id={tableId}
            data-testid={tableId}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={tableId}
                    query={isEcosystemRhs ? '' : query}
                    text={name}
                    title={name}
                />
            </Header>
            <InnertTable
                id={`${tableId}-inner-table`}
                className='innerTable'
            >
                <TableHeader
                    headers={headers}
                />

                {rows?.map((row) => (
                    <TableRow
                        key={row.id}
                        onClick={open ? () => open(row.id) : undefined}
                        pointer={pointer}
                        query={isEcosystemRhs ? '' : query}
                        row={row}
                        urlHash={urlHash}
                    />
                ))}
                <Footer>
                    <FooterText>{caption}</FooterText>
                </Footer>
            </InnertTable>
        </Container>
    );
};

const InnertTable = styled.div`
    font-family: 'Open Sans', sans-serif;
    color: rgba(var(--center-channel-color-rgb), 0.90);
`;

const Footer = styled.div`
    margin: 10px 0;
    font-size: 14px;
`;

const FooterText = styled.div`
    padding-top: 8px;
    width: 100%;
    text-align: center;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default Table;