import React, {useContext, useEffect, useState} from 'react';
import {useIntl} from 'react-intl';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {formatName, formatStringToCapitalize} from 'src/helpers';
import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {SelectObject, defaultSelectObject} from 'src/types/object_select';
import ObjectSelect from 'src/components/backstage/widgets/select/object_select';

import {Container} from './playbook';
import CacaoCommand, {getCommandById, getCommandObjects, getFirstCommandObject} from './command';

type Props = {
    step: any;
    workflow: any;
    parentId: string;
    sectionId: string;
};

export const getWorkflowStepObjectById = (workflow: any | undefined, stepId: string): SelectObject => {
    if (!workflow) {
        return defaultSelectObject;
    }
    return {
        label: workflow[stepId].name as string,
        value: stepId,
    };
};

export const getWorkflowStepObjects = (workflow: any | undefined): SelectObject[] => {
    if (!workflow) {
        return [];
    }
    return Object.keys(workflow).map((stepId) => ({
        label: workflow[stepId].name ?? stepId,
        value: stepId,
    }));
};

export const getWorkflowStepById = (workflow: any, stepId: string): any => {
    return workflow[stepId];
};

export const getWorkflowStepNameById = (workflow: any, stepId: string): any => {
    return getWorkflowStepById(workflow, stepId).name;
};

export const getWorkflowStepIds = (workflow: any): string[] => {
    if (!workflow) {
        return [];
    }
    return Object.keys(workflow);
};

const CacaoWorkflowStep = ({
    step,
    workflow,
    parentId,
    sectionId,
}: Props) => {
    console.log('workflow', {step});
    const {formatMessage} = useIntl();

    // const urlHash = useUrlHash();

    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const prefix = `${step.id}-`;
    const name = step.name ?? step.id;
    const id = `${formatName(step.id)}-${sectionId}-${parentId}`;
    const query = buildQuery(parentId, sectionId);

    const [selectedCommand, setSelectedCommand] = useState<SelectObject>(defaultSelectObject);
    useEffect(() => {
        setSelectedCommand(getFirstCommandObject(step.commands));
    }, [step]);

    // TODO: needed when commands will have a unique id
    // This also needs to update the selectedWorkflowStep from the playbook parent component,
    // thus requiring a change to the object select component
    // useEffect(() => {
    //     const commandsIds = getStepCommandsIds(step.commands);
    //     const hashedId = commandsIds.find((commandId) => urlHash.includes(commandId));
    //     if (hashedId) {
    //         // Remember return here when adding more object selects
    //         setSelectedStepCommand(getStepCommandObjectById(step.commands, hashedId));
    //     }
    // }, [urlHash]);

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={isEcosystemRhs ? '' : query}
                    text={name}
                    title={name}
                />
            </Header>
            {step.type &&
                <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'Type'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={formatStringToCapitalize(step.type)}
                />}
            {step.description &&
                <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'Description'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={step.description}
                />}
            {step.on_completion &&
                <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'On completion'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={getWorkflowStepNameById(workflow, step.on_completion)}
                />}
            {step.type === 'action' && selectedCommand !== defaultSelectObject &&
                <ObjectSelect
                    name={formatMessage({defaultMessage: 'Commands'})}
                    objects={getCommandObjects(step.commands)}
                    selectedObject={selectedCommand}
                    setSelectedObject={setSelectedCommand}
                    parentId={parentId}
                    sectionId={sectionId}
                >
                    {step.commands && step.commands.length > 0 &&
                        <CacaoCommand
                            command={{
                                ...getCommandById(step.commands, selectedCommand.value),
                                id: selectedCommand.value,
                            }}
                            parentId={parentId}
                            sectionId={sectionId}
                        />}
                </ObjectSelect>}
        </Container>
    );
};

export default CacaoWorkflowStep;