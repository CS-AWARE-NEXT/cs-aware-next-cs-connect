import React from 'react';

import {DocumentationItem} from './documentation';

type Props = {
    item: DocumentationItem;
};

const DocumentationItemView = ({item}: Props) => {
    const {id, name, content: Content} = item;
    return (
        <>
            <h1 id={id}>{name}</h1>
            {Content && <Content/>}
        </>
    );
};

export default DocumentationItemView;