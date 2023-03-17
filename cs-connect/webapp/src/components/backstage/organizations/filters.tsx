// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import debounce from 'debounce';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {FetchOrganizationsParams} from 'src/types/organization';
import SearchInput from 'src/components/backstage/search_input';

type Props = {
    fetchParams: FetchOrganizationsParams;
    setFetchParams: React.Dispatch<React.SetStateAction<FetchOrganizationsParams>>;
};

const searchDebounceDelayMilliseconds = 300;

const Filters = ({fetchParams, setFetchParams}: Props) => {
    const {formatMessage} = useIntl();

    const setSearchTerm = (term: string) => {
        setFetchParams((oldParams) => {
            return {...oldParams, search_term: term, page: 0};
        });
    };

    const onSearch = useMemo(
        () => debounce(setSearchTerm, searchDebounceDelayMilliseconds),
        [setSearchTerm],
    );

    return (
        <ProductListFilters>
            <SearchInput
                testId={'search-filter'}
                default={fetchParams.search_term}
                onSearch={onSearch}
                placeholder={formatMessage({defaultMessage: 'Search by organization name'})}
            />
        </ProductListFilters>
    );
};

const ProductListFilters = styled.div`
    display: flex;
    align-items: center;
    padding: 1rem 16px;
    gap: 4px;
`;

export default Filters;
