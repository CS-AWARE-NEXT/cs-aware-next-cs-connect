import React from 'react';
import styled from 'styled-components';

import {ColHeader} from 'src/components/commons/col_header';
import {TableHeaderData} from 'src/types/table';

type Props = {
    headers: TableHeaderData[];
};

const TableHeader = ({headers}: Props) => {
    return (
        <InnerTableHeader>
            <div className='row'>
                {headers?.map(({dim, name}) => (
                    <div
                        key={name}
                        className={`col-sm-${dim}`}
                    >
                        <ColHeader name={name}/>
                    </div>
                ))}
            </div>
        </InnerTableHeader>
    );
};

const InnerTableHeader = styled.div`
    font-weight: 600;
    font-size: 11px;
    line-height: 36px;
    color: rgba(var(--center-channel-color-rgb), 0.72);
    background-color: rgba(var(--center-channel-color-rgb), 0.04);
    padding: 0 1.6rem;
    border-top: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
`;

export default TableHeader;