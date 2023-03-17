import React from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {BACKSTAGE_LIST_PER_PAGE} from 'src/constants';
import Header from 'src/components/commons/header';
import {useOrganizationsList} from 'src/hooks';

import OrganizationsList from './organizations_list';

const defaultOrganizationsFetchParams = {
    page: 0,
    per_page: BACKSTAGE_LIST_PER_PAGE,
    sort: 'name',
};

const OrganizationsPage = () => {
    const {formatMessage} = useIntl();
    const [organizations, totalCount, fetchParams, setFetchParams] = useOrganizationsList(defaultOrganizationsFetchParams);

    return (
        <OrganizationListContainer>
            <Header
                data-testid='titleOrganization'
                level={2}
                heading={formatMessage({defaultMessage: 'Organizations'})}
                subtitle={formatMessage({defaultMessage: 'All the organizations will show here'})}
                css={`
                    border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
                `}
            />
            <OrganizationsList
                organizations={organizations}
                totalCount={totalCount}
                fetchParams={fetchParams}
                setFetchParams={setFetchParams}
                filterPill={null}
            />
        </OrganizationListContainer>
    );
};

const OrganizationListContainer = styled.div`
    flex: 1 1 auto;
`;

export default OrganizationsPage;
