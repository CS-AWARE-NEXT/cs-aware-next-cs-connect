import React, {useContext, useEffect, useState} from 'react';
import styled, {css} from 'styled-components';
import {useIntl} from 'react-intl';
import moment from 'moment';
import {Avatar} from 'antd';
import {AlignCenterOutlined} from '@ant-design/icons';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery, useUrlHash} from 'src/hooks';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {formatName, formatNameNoUnderscore} from 'src/helpers';
import {fromStrings} from 'src/types/list';
import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import ItemsList from 'src/components/backstage/widgets/list/list';
import {SelectObject, defaultSelectObject} from 'src/types/object_select';
import ObjectSelect from 'src/components/backstage/widgets/select/object_select';
import Table from 'src/components/backstage/widgets/table/table';
import {TableData, TableRowData} from 'src/types/table';

import CacaoExternalReference, {
    getExternalReferenceByName,
    getExternalReferenceObjectByFormattedName,
    getExternalReferenceObjects,
    getExternalReferencesFormattedNames,
    getFirstExternalReferenceObject,
} from './external_reference';
import CacaoWorkflowStep, {
    getWorkflowStepById,
    getWorkflowStepIds,
    getWorkflowStepObjectById,
    getWorkflowStepObjects,
} from './workflow_step';

type Props = {
    data: any;
    name: string;
    parentId: string;
    sectionId: string;
};

const DESCRIPTION_ID_PREFIX = 'cacao-playbook-';
const TABLE_ID_PREFIX = 'cacao-playbook-';

const convertVariablesToTableData = (variables: any, caption: string): TableData => {
    const rows: TableRowData[] = Object.keys(variables).map((variableName) => {
        const type = (variables[variableName].type || '') as string;
        const description = (variables[variableName].description || '') as string;
        const value = (variables[variableName].value || '') as string;

        // TODO: verify the utility of this two values
        // const constant = `${(variables[variableName].constant || false)}`;
        // const external = `${(variables[variableName].external || false)}`;

        // {value: constant, dim: 1},
        // {value: external, dim: 1},
        const name = formatNameNoUnderscore(variableName);
        return {
            id: name,
            name,
            values: [
                {value: variableName, dim: 4},
                {value: type, dim: 3},
                {value: description, dim: 3},
                {value, dim: 2},
            ],
        };
    });

    // {name: 'Constant', dim: 1},
    // {name: 'External', dim: 1},
    return {
        headers: [
            {name: 'Name', dim: 4},
            {name: 'Type', dim: 3},
            {name: 'Description', dim: 3},
            {name: 'Value', dim: 2},
        ],
        rows,
        caption,
    };
};

const CacaoPlaybook = ({
    data,
    name,
    parentId,
    sectionId,
}: Props) => {
    const {formatMessage} = useIntl();
    const urlHash = useUrlHash();

    const isRhs = useContext(IsRhsContext);
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const query = buildQuery(parentId, sectionId);
    const listFlexGrow = isRhs ? 1 : 0;

    const [selectedExternalReference, setSelectedExternalReference] = useState<SelectObject>(defaultSelectObject);
    useEffect(() => {
        setSelectedExternalReference(getFirstExternalReferenceObject(data.external_references));
    }, [data]);

    const [selectedWorkflowStep, setSelectedWorkflowStep] = useState<SelectObject>(defaultSelectObject);
    useEffect(() => {
        setSelectedWorkflowStep(getWorkflowStepObjectById(data.workflow, data.workflow_start));
    }, [data]);

    useEffect(() => {
        const externalReferencesNames = getExternalReferencesFormattedNames(data.external_references);
        const hashedName = externalReferencesNames.find((externalReferenceName) => urlHash.includes(externalReferenceName));
        if (hashedName) {
            setSelectedExternalReference(getExternalReferenceObjectByFormattedName(data.external_references, hashedName));
            return;
        }
        const stepsIds = getWorkflowStepIds(data.workflow);
        const hashedId = stepsIds.find((stepId) => urlHash.includes(stepId));
        if (hashedId) {
            // Remember return here when adding more object selects
            setSelectedWorkflowStep(getWorkflowStepObjectById(data.workflow, hashedId));
        }
    }, [urlHash]);

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
            {data.description &&
                <TextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Description'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={data.description}
                />
            }
            <BorderBox>
                <HorizontalContainer>
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Created'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`Created ${moment(data.created).format('MMMM Do YYYY, h:mm:ss a')} by ${data.created_by}`}
                        style={{marginTop: '24px', marginRight: '8px'}}
                    />
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Modified'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`Modified ${moment(data.modified).format('MMMM Do YYYY, h:mm:ss a')}`}
                    />
                </HorizontalContainer>
                <HorizontalContainer>
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Validity'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`Valid from ${moment(data.valid_from).format('MMMM Do YYYY, h:mm:ss a')} to ${moment(data.valid_until).format('MMMM Do YYYY, h:mm:ss a')}`}
                        style={{marginTop: '24px', marginRight: '8px'}}
                    />
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Derived From'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`${data.derived_from}`}
                    />
                </HorizontalContainer>
            </BorderBox>
            <HorizontalContainer>
                {data.severity &&
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Severity'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`${data.severity}`}
                        style={{marginTop: '24px', marginRight: '8px'}}
                    />}
                {data.priority &&
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Priority'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`${data.priority}`}
                        style={{marginTop: '24px', marginRight: '8px'}}
                    />}
                {data.impact &&
                    <TextBox
                        idPrefix={DESCRIPTION_ID_PREFIX}
                        name={formatMessage({defaultMessage: 'Impact'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={`${data.impact}`}
                    />}
            </HorizontalContainer>
            <HorizontalContainer disable={isRhs}>
                <ItemsList
                    data={fromStrings(data.labels)}
                    name={formatMessage({defaultMessage: 'Labels'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    Avatar={<Avatar icon={<AlignCenterOutlined/>}/>}
                    flexGrow={listFlexGrow}
                    marginRight={isRhs ? '0' : '8px'}
                />
                <ItemsList
                    data={fromStrings(data.industry_sectors)}
                    name={formatMessage({defaultMessage: 'Industry Sectors'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    Avatar={<Avatar icon={<AlignCenterOutlined/>}/>}
                    flexGrow={listFlexGrow}
                />
            </HorizontalContainer>
            <HorizontalContainer disable={isRhs}>
                <ItemsList
                    data={fromStrings(data.playbook_types)}
                    name={formatMessage({defaultMessage: 'Types'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    Avatar={<Avatar icon={<AlignCenterOutlined/>}/>}
                    flexGrow={listFlexGrow}
                    marginRight={isRhs ? '0' : '8px'}
                />
                <ItemsList
                    data={fromStrings(data.playbook_activities)}
                    name={formatMessage({defaultMessage: 'Activities'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    Avatar={<Avatar icon={<AlignCenterOutlined/>}/>}
                    flexGrow={listFlexGrow}
                />
            </HorizontalContainer>

            {selectedWorkflowStep !== defaultSelectObject &&
                <ObjectSelect
                    name={formatMessage({defaultMessage: 'Workflow'})}
                    objects={getWorkflowStepObjects(data.workflow)}
                    selectedObject={selectedWorkflowStep}
                    setSelectedObject={setSelectedWorkflowStep}
                    parentId={parentId}
                    sectionId={sectionId}
                >
                    {data.workflow &&
                        <CacaoWorkflowStep
                            step={{
                                ...getWorkflowStepById(data.workflow, selectedWorkflowStep.value),
                                id: selectedWorkflowStep.value,
                            }}
                            workflow={data.workflow}
                            parentId={parentId}
                            sectionId={sectionId}
                        />}
                </ObjectSelect>}

            {data.playbook_variables &&
                <Table
                    data={convertVariablesToTableData(
                        data.playbook_variables,
                        formatMessage({defaultMessage: 'Playbook variables.'}),
                    )}
                    id={`${TABLE_ID_PREFIX}variables-`}
                    name={formatMessage({defaultMessage: 'Variables'})}
                    parentId={parentId}
                    sectionId={sectionId}
                    urlHash={urlHash}
                />}

            {selectedExternalReference !== defaultSelectObject &&
                <ObjectSelect
                    name={formatMessage({defaultMessage: 'External References'})}
                    objects={getExternalReferenceObjects(data.external_references)}
                    selectedObject={selectedExternalReference}
                    setSelectedObject={setSelectedExternalReference}
                    parentId={parentId}
                    sectionId={sectionId}
                >
                    {data.external_references && data.external_references.length > 0 &&
                        <CacaoExternalReference
                            data={getExternalReferenceByName(data.external_references, selectedExternalReference.value)}
                            parentId={parentId}
                            sectionId={sectionId}
                        />}
                </ObjectSelect>}
        </Container>
    );
};

export const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export const HorizontalContainer = styled.div<{disable?: boolean}>`
    display: flex;
    flex-direction: ${({disable}) => (disable ? 'column' : 'row')};
    justify-content: ${({disable}) => (disable ? 'flex-start' : 'space-between')};
    margin: ${({disable}) => (disable ? '0' : '0 -8px')};
`;

export const BorderBox = styled.div<{border?: boolean}>`
    ${({border}) => border && css`
        border: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
    `}
`;

export default CacaoPlaybook;