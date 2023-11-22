import React, {useContext} from 'react';
import styled from 'styled-components';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {formatName} from 'src/helpers';
import Accordion from 'src/components/backstage/widgets/accordion/accordion';
import {ExerciseAssignment} from 'src/types/exercise';
import {SectionInfo} from 'src/types/organization';

import ExerciseAccordionChild, {ExerciseElementType} from './exercise_accordion_child';

type Props = {
    data: ExerciseAssignment;
    name: string;
    parentId: string;
    sectionId: string;
};

const Exercise = ({
    data,
    name = '',
    parentId,
    sectionId,
}: Props) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    const incidentsElements = data?.incidents?.map((incident: SectionInfo) => ({
        ...incident,
        type: ExerciseElementType.Incident,
        header: incident.name,
        id: `${data.exerciseId}-${incident.id}`,
    })) ?? [];

    const assignmentId = `${data.exerciseId}-assignment`;
    const elements = [
        {
            type: ExerciseElementType.Assignment,
            id: assignmentId,
            name: 'Assignment',
            header: 'Assignment',
            ...data?.assignment,
        },
        ...incidentsElements,
    ];

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={isEcosystemRhs ? '' : ecosystemQuery}
                    text={name}
                    title={name}
                />
            </Header>
            {data?.assignment &&
                <Accordion
                    name={name}
                    withHeader={false}
                    defaultActiveKey={`${assignmentId}-panel-key`}
                    childComponent={ExerciseAccordionChild}
                    elements={elements}
                    parentId={parentId}
                    sectionId={sectionId}
                />}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default Exercise;