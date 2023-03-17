// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {FetchOrganizationsParams} from 'src/types/organization';
import {SortableColHeader} from 'src/components/commons/sortable_col_header';

type Props = {
    fetchParams: FetchOrganizationsParams;
    setFetchParams: React.Dispatch<React.SetStateAction<FetchOrganizationsParams>>;
};

const OrganizationsListHeader = ({fetchParams, setFetchParams}: Props) => {
    const {formatMessage} = useIntl();

    const colHeaderClicked = (colName: string) => {
        if (fetchParams.sort === colName) {
            // if the direction is not provided, the default is ascending
            // if we're already sorting on the column, reverse the direction
            const defaultDirection = fetchParams.direction ? fetchParams.direction : 'asc';
            const newDirection = defaultDirection === 'asc' ? 'desc' : 'asc';

            setFetchParams((oldParams: FetchOrganizationsParams) => {
                return {...oldParams, direction: newDirection, page: 0};
            });
            return;
        }

        // change to a new column; default to ascending
        const newDirection = 'asc';

        setFetchParams((oldParams: FetchOrganizationsParams) => {
            return {...oldParams, sort: colName, direction: newDirection, page: 0};
        });
    };

    return (
        <OrganizationListHeader>
            <div className='row'>
                <div className='col-sm-4'>
                    <SortableColHeader
                        name={formatMessage({defaultMessage: 'Name'})}
                        direction={fetchParams.direction ? fetchParams.direction : 'asc'}
                        active={fetchParams.sort ? fetchParams.sort === 'name' : false}
                        onClick={() => colHeaderClicked('name')}
                    />
                </div>
            </div>
        </OrganizationListHeader>
    );
};

const OrganizationListHeader = styled.div`
    font-weight: 600;
    font-size: 11px;
    line-height: 36px;
    color: rgba(var(--center-channel-color-rgb), 0.72);
    background-color: rgba(var(--center-channel-color-rgb), 0.04);
    padding: 0 1.6rem;
    border-top: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
`;

export default OrganizationsListHeader;
