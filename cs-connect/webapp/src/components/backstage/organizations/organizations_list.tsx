import React from 'react';
import styled from 'styled-components';
import {FormattedMessage} from 'react-intl';
import InfiniteScroll from 'react-infinite-scroll-component';

import LoadingSpinner from 'src/components/assets/loading_spinner';
import {FetchOrganizationsParams, Organization} from 'src/types/organization';

import Row from './row';
import OrganizationsListHeader from './organizations_list_header';
import Filters from './filters';

type Props = {
    organizations: Organization[];
    fetchParams: FetchOrganizationsParams;
    filterPill: React.ReactNode | null;
    setFetchParams: React.Dispatch<React.SetStateAction<FetchOrganizationsParams>>;
    totalCount: number;
};

const OrganizationsList = ({
    organizations,
    fetchParams,
    filterPill,
    setFetchParams,
    totalCount,
}: Props) => {
    const isFiltering = (
        (fetchParams?.search_term?.length ?? 0) > 0
    );

    const nextPage = () => {
        setFetchParams((oldParam: FetchOrganizationsParams) => ({...oldParam, page: oldParam.page + 1}));
    };

    return (
        <OrganizationList
            id='organizationsList'
            className='organizationsList'
        >
            <Filters
                fetchParams={fetchParams}
                setFetchParams={setFetchParams}
            />
            {filterPill}
            <OrganizationsListHeader
                fetchParams={fetchParams}
                setFetchParams={setFetchParams}
            />
            {organizations === null && isFiltering &&
                <div className='text-center pt-8'>
                    <FormattedMessage defaultMessage='There are no organizations matching those filters.'/>
                </div>
            }
            <InfiniteScroll
                dataLength={organizations?.length}
                next={nextPage}
                hasMore={organizations?.length < totalCount}
                loader={<SpinnerContainer><StyledSpinner/></SpinnerContainer>}
                scrollableTarget={'organization-backstageRoot'}
            >
                {organizations?.map((organization) => (
                    <Row
                        key={organization.id}
                        organization={organization}
                    />
                ))}
            </InfiniteScroll>
            <Footer>
                <Count>
                    <FormattedMessage
                        defaultMessage='{total, number} total'
                        values={{total: totalCount}}
                    />
                </Count>
            </Footer>
        </OrganizationList>
    );
};

const OrganizationList = styled.div`
    font-family: 'Open Sans', sans-serif;
    color: rgba(var(--center-channel-color-rgb), 0.90);
`;

const Footer = styled.div`
    margin: 10px 0 20px;
    font-size: 14px;
`;

const Count = styled.div`
    padding-top: 8px;
    width: 100%;
    text-align: center;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const SpinnerContainer = styled.div`
    width: 100%;
    height: 24px;
    text-align: center;
    margin-top: 10px;
    overflow: visible;
`;

const StyledSpinner = styled(LoadingSpinner)`
    width: auto;
    height: 100%;
`;

export default OrganizationsList;
