import React from 'react';

import {AccordionData} from 'src/types/accordion';

import AssignmentPart from './exercise_parts/assignment_part';
import IncidentPart from './exercise_parts/incident_part';

export enum ExerciseElementType {
    Assignment = 'assignment',
    Incident = 'incident',
}

type Props = {
    element: AccordionData;
    parentId?: string;
    sectionId?: string;
};

const ExerciseAccordionChild = ({element, parentId, sectionId}: Props) => {
    return (
        <>
            {element.type === ExerciseElementType.Assignment &&
                <AssignmentPart
                    data={element}
                    name={element.name}
                    parentId={parentId || ''}
                    sectionId={sectionId || ''}
                />}
            {element.type === ExerciseElementType.Incident &&
                <IncidentPart
                    data={element}
                    name={element.name}
                    parentId={parentId || ''}
                    sectionId={sectionId || ''}
                />}
        </>
    );
};

export default ExerciseAccordionChild;