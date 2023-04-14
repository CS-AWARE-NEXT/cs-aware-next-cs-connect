import React from 'react';

import {LHSContainer} from 'src/components/backstage/lhs/lhs_navigation';

import DocumentationSidebar from './documentation_sidebar';
import DocumentationMainBody from './documentation_main_body';

export type DocumentationMapItem = {
    id: string;
    name: string;
    path: string;
};

const items: DocumentationMapItem[] = [
    {id: 'about-the-platform', name: 'About the platform', path: 'about'},
    {id: 'hyperlinking-mechanism', name: 'Hyperlinking Mechanism', path: 'mechanism'},
];

// Back to channels: http://localhost:8065/cs/channels/
const Documentation = () => {
    return (
        <>
            <LHSContainer data-testid='lhs-navigation'>
                <DocumentationSidebar items={items}/>
            </LHSContainer>
            <DocumentationMainBody/>
        </>
    );
};

export default Documentation;