import React, {useContext} from 'react';
import styled from 'styled-components';
import {useRouteMatch} from 'react-router-dom';

import {
    buildIdForUrlHashReference,
    buildTo,
    buildToForCopy,
    isReferencedByUrlHash,
} from 'src/hooks';
import CopyLink from 'src/components/commons/copy_link';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {TableRowData} from 'src/types/table';

type Props = {
    pointer: boolean;
    query?: string;
    row: TableRowData;
    urlHash: string;
    onClick?: () => void;
};

const TableRow = ({onClick, pointer, query, row, urlHash}: Props) => {
    const fullUrl = useContext(FullUrlContext);
    const {url} = useRouteMatch();

    const {id, name, values} = row;
    const itemId = buildIdForUrlHashReference('table-row', id);

    return (
        <RowItem
            className='row'
            key={id}
            id={itemId}
            isUrlHashed={isReferencedByUrlHash(urlHash, itemId)}
            pointer={pointer}
            onClick={onClick}
        >
            <CopyLink
                id={itemId}
                text={name}
                to={buildToForCopy(buildTo(fullUrl, itemId, query, url))}
                name={name}
                area-hidden={true}
                iconWidth={'1.45em'}
                iconHeight={'1.45em'}
            />
            {values.map(({dim, value}, index) => (
                <div
                    key={`col-value-${value}-${index}`}
                    className={`col-sm-${dim}`}
                >
                    <RowText>{value}</RowText>
                </div>
            ))}
        </RowItem>
    );
};

// cursor: pointer; if you want to enable again copy on click
const RowItem = styled.div<{isUrlHashed?: boolean, pointer?: boolean}>`
    display: flex;
    padding-top: 8px;
    padding-bottom: 8px;
    align-items: center;
    margin: 0;
    background: ${(props) => (props.isUrlHashed ? 'rgba(var(--center-channel-color-rgb), 0.08)' : 'var(--center-channel-bg)')};
    border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
    cursor: ${(props) => (props.pointer ? 'pointer' : 'auto')};
    ${CopyLink} {
        margin-left: -1.25em;
        opacity: 1;
        transition: opacity ease 0.15s;
    }

    &:not(:hover) ${CopyLink}:not(:hover) {
        opacity: 0;
    }

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.04);
    }
`;

const RowText = styled.div`
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
`;

export default TableRow;