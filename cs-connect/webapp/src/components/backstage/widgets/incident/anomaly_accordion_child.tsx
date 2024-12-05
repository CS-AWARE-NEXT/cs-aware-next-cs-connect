import React from 'react';

import {AccordionData} from 'src/types/accordion';

import Anomaly from './anomaly';

type Props = {
    element: AccordionData;
    parentId?: string;
    sectionId?: string;
};

const AnomalyAccordionChild = ({element, parentId, sectionId}: Props) => {
    return (
        <Anomaly
            key={element.id}
            data={element.anomaly}
            name={element.name}
            parentId={parentId || ''}
            sectionId={sectionId || ''}
        />
    );
};

export default AnomalyAccordionChild;