import React, {ElementType} from 'react';

import {LHSContainer} from 'src/components/backstage/lhs/lhs_navigation';

import DocumentationSidebar from './documentation_sidebar';
import DocumentationMainBody from './documentation_main_body';
import About from './contents/about';
import Mechanism from './contents/mechanism';
import Demo from './contents/demo';

type DocumentationItemProps = {};

export type DocumentationItem = {
    id: string;
    name: string;
    path: string;
    content?: ElementType<DocumentationItemProps>;
};

const items: DocumentationItem[] = [
    {id: 'about-the-platform', name: 'About The Platform', path: 'about', content: About},
    {id: 'hyperlinking-mechanism', name: 'Hyperlinking Mechanism', path: 'mechanism', content: Mechanism},
    {id: 'hyperlinking-demo', name: 'Hyperlinking Demo', path: 'demo', content: Demo},
];

const Documentation = () => {
    return (
        <>
            <LHSContainer data-testid='lhs-navigation'>
                <DocumentationSidebar items={items}/>
            </LHSContainer>
            <DocumentationMainBody items={items}/>
        </>
    );
};

export default Documentation;