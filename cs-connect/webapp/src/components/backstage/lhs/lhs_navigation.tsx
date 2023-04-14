import React from 'react';
import styled from 'styled-components';

import OrganizationsSidebar from 'src/components/sidebar/organizations_sidebar';

const LHSNavigation = () => {
    return (
        <LHSContainer data-testid='lhs-navigation'>
            <OrganizationsSidebar/>
        </LHSContainer>
    );
};

export const LHSContainer = styled.div`
    width: 240px;
    background-color: var(--sidebar-bg);

    display: flex;
    flex-direction: column;
`;

export default LHSNavigation;
