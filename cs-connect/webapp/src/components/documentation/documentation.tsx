import React from 'react';

import {LHSContainer} from 'src/components/backstage/lhs/lhs_navigation';

import DocumentationSidebar from './documentation_sidebar';

// Back to channels: http://localhost:8065/cs/channels/
const Documentation = () => {
    return (
        <LHSContainer data-testid='lhs-navigation'>
            <DocumentationSidebar/>
        </LHSContainer>
    );
};

const style = {
    cr: {
        padding: '10px',
    },
};

export default Documentation;