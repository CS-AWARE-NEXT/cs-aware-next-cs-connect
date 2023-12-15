import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {Button, Modal, Steps} from 'antd';
import styled from 'styled-components';
import {FormattedMessage, useIntl} from 'react-intl';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';
import {useSelector} from 'react-redux';
import {useRouteMatch} from 'react-router-dom';

import {getCurrentUserId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';

import {addChannel, saveSectionInfo, updateSectionInfo} from 'src/clients';
import {navigateToUrl} from 'src/browser_routing';
import {
    formatName,
    formatSectionPath,
    formatStringToCapitalize,
    isNameCorrect,
} from 'src/helpers';
import {
    PARENT_ID_PARAM,
    ecosystemAttachmentsWidget,
    ecosystemElementsWidget,
    ecosystemObjectivesWidget,
    ecosystemOutcomesWidget,
    ecosystemRolesWidget,
} from 'src/constants';
import {useOrganization} from 'src/hooks';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import {HorizontalSpacer} from 'src/components/backstage/grid';
import {ErrorMessage} from 'src/components/commons/messages';
import {SectionInfo} from 'src/types/organization';
import {
    Attachment,
    ElementData,
    Outcome,
    StepRole,
} from 'src/types/scenario_wizard';

import ObjectivesStep from './steps/objectives_step';
import OutcomesStep, {fillOutcomes} from './steps/outcomes_step';
import RolesStep from './steps/roles_step';
import TechnologyStep from './steps/technology_step';
import AttachmentsStep, {fillAttachments} from './steps/attachments_step';

type Props = {
    organizationsData: ElementData[];
    name: string;
    parentId: string;
    targetUrl: string;
    prefillWizardData?: SectionInfo;
    wizardDataSetter?: React.Dispatch<React.SetStateAction<SectionInfo | undefined>>;
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit?: boolean;
};

type WizardData = {
    name: string;
    objectives: string;
    outcomes: string[];
    roles: StepRole[];
    elements: any;
    attachments: string[];
}

const emptyWizardData = {
    name: '',
    objectives: '',
    outcomes: [],
    roles: [],
    elements: {},
    attachments: [],
} as WizardData;

const getSteps = (organizationsData: any, wizardData: any, setWizardData: any, wizardDataError: any, setWizardDataError: any) => {
    return [
        {
            title: formatStringToCapitalize(ecosystemObjectivesWidget),
            content: (
                <ObjectivesStep
                    data={{name: wizardData.name, objectives: wizardData.objectives}}
                    setWizardData={setWizardData}
                    errorData={{nameError: wizardDataError.nameError}}
                    setWizardDataError={setWizardDataError}
                />),
        },
        {
            title: formatStringToCapitalize(ecosystemOutcomesWidget),
            content: (
                <OutcomesStep
                    data={wizardData.outcomes}
                    setWizardData={setWizardData}
                />),
        },
        {
            title: formatStringToCapitalize(ecosystemRolesWidget),
            content: (
                <RolesStep
                    data={wizardData.roles}
                    setWizardData={setWizardData}
                />),
        },
        {
            title: formatStringToCapitalize(ecosystemElementsWidget),
            content: (
                <TechnologyStep
                    data={wizardData.elements}
                    organizationsData={organizationsData}
                    setWizardData={setWizardData}
                />
            ),
        },
        {
            title: formatStringToCapitalize(ecosystemAttachmentsWidget),
            content: (
                <AttachmentsStep
                    data={wizardData.attachments}
                    setWizardData={setWizardData}
                />),
        },
    ];
};

const ScenarioWizardModal = ({
    organizationsData,
    name,
    parentId,
    targetUrl,
    prefillWizardData,
    wizardDataSetter,
    visible,
    setVisible,
    isEdit = false,
}: Props) => {
    const {formatMessage} = useIntl();
    const {path} = useRouteMatch();
    const teamId = useSelector(getCurrentTeamId);
    const userId = useSelector(getCurrentUserId);
    const organizationId = useContext(OrganizationIdContext);
    const organization = useOrganization(organizationId);

    const emptyWizardDataError = {
        nameError: '',
    };

    const [errorMessage, setErrorMessage] = useState('');
    const [current, setCurrent] = useState(0);
    const [wizardData, setWizardData] = useState(emptyWizardData);
    const [wizardDataError, setWizardDataError] = useState(emptyWizardDataError);

    const refreshWizardData = () => {
        if (!prefillWizardData || !organizationsData || !organizationsData.length) {
            setWizardData(emptyWizardData);
            return;
        }

        // Elements are represented as an object with the key being the org data type (Incident, Social...) and the value being the array of related selectable elements
        const elements: any = {};
        if (prefillWizardData.elements) {
            organizationsData.forEach((type) => {
                const options = type.options.filter((option) => prefillWizardData.elements.find((el: any) => el.id === option.id));
                if (options.length > 0) {
                    elements[type.title] = type.options.filter((option) => prefillWizardData.elements.find((el: any) => el.id === option.id));
                }
            });
        }

        const outcomes = prefillWizardData.outcomes ? (prefillWizardData.outcomes as Outcome[]).
            map((outcome) => outcome.outcome) : null;

        const attachments = prefillWizardData.attachments ? (prefillWizardData.attachments as Attachment[]).
            map((attachment) => attachment.attachment) : null;

        const data = {
            name: prefillWizardData.name,
            objectives: prefillWizardData.objectivesAndResearchArea,
            outcomes,
            roles: prefillWizardData.roles,
            elements,
            attachments,
        } as WizardData;
        setWizardData(data);
    };

    useEffect(() => {
        refreshWizardData();
    }, [prefillWizardData, organizationsData]);

    const cleanModal = () => {
        setVisible(false);
        setCurrent(0);
        refreshWizardData();
        setWizardDataError(emptyWizardDataError);
        setErrorMessage('');
    };

    const isOk = (): boolean => {
        const nameError = isNameCorrect(wizardData.name);
        if (nameError !== '') {
            setWizardDataError((prev: any) => ({...prev, nameError}));
            setCurrent(0);
            return false;
        }
        return true;
    };

    const saveIssue = async (issue: SectionInfo) => {
        try {
            const savedSectionInfo = await saveSectionInfo(issue, targetUrl);
            await addChannel({
                userId,
                channelName: formatName(`${organization.name}-${savedSectionInfo.name}`),
                createPublicChannel: true,
                parentId,
                sectionId: savedSectionInfo.id,
                teamId,
                organizationId,
            });
            cleanModal();
            const basePath = `${formatSectionPath(path, organizationId)}/${formatName(name)}`;
            navigateToUrl(`${basePath}/${savedSectionInfo.id}?${PARENT_ID_PARAM}=${parentId}`);
        } catch (err: any) {
            const message = JSON.parse(err.message);
            setErrorMessage(`${message.error}.`);
            setCurrent(0);
        }
    };

    const editIssue = async (issue: SectionInfo) => {
        issue.id = prefillWizardData?.id || '';
        try {
            const newData = await updateSectionInfo(issue, `${targetUrl}/${issue.id}`);
            cleanModal();
            if (wizardDataSetter) {
                wizardDataSetter(newData);
            }
        } catch (err: any) {
            const message = JSON.parse(err.message);
            setErrorMessage(`${message.error}.`);
            setCurrent(0);
        }
    };

    const handleOk = async () => {
        if (!isOk()) {
            return;
        }

        const issue: SectionInfo = {
            id: '',
            name: wizardData.name,
            objectivesAndResearchArea: wizardData.objectives,
            outcomes: fillOutcomes(wizardData.outcomes || []),
            elements: Object.values(wizardData.elements).flat(),
            roles: wizardData.roles,
            attachments: fillAttachments(wizardData.attachments || []),
        };

        if (isEdit) {
            editIssue(issue);
        } else {
            saveIssue(issue);
        }
    };

    const handleCancel = () => {
        cleanModal();
    };

    const steps = useMemo(() => getSteps(organizationsData, wizardData, setWizardData, wizardDataError, setWizardDataError), [wizardData, wizardDataError, organizationsData]);
    const items = steps.map(({title}: any) => ({key: title, title}));

    return (
        <Modal
            width={'80vw'}
            centered={true}
            open={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            title={isEdit ? formatMessage({defaultMessage: 'Update issue'}) : formatMessage({defaultMessage: 'Create New'})}
            focusTriggerAfterClose={false} // Required to avoid modal triggered by tooltip-enabled buttons causing the tooltip to get stuck as visible
            footer={[
                <Button
                    key='back'
                    onClick={() => setCurrent(current - 1)}
                    disabled={current === 0}
                >
                    <FormattedMessage defaultMessage='Previous'/>
                </Button>,
                <Button
                    key='next'
                    onClick={() => setCurrent(steps.length - 1 === current ? current : current + 1)}
                    disabled={current === steps.length - 1}
                >
                    <FormattedMessage defaultMessage='Next'/>
                </Button>,
                <Button
                    key='submit'
                    type='primary'
                    onClick={handleOk}
                    disabled={current !== steps.length - 1}
                >
                    {isEdit ? <FormattedMessage defaultMessage={'Update'}/> : <FormattedMessage defaultMessage={'Create'}/>}
                </Button>,
            ]}
        >
            <ModalBody>
                <Steps
                    progressDot={true}
                    current={current}
                    items={items}
                />
                {steps[current].content}
            </ModalBody>
            <HorizontalSpacer size={1}/>
            <ErrorMessage display={errorMessage !== ''}>
                {errorMessage}
            </ErrorMessage>
        </Modal>
    );
};

const ModalBody = styled.div`
    max-height: 80vh;
    overflow-y: auto;
    padding: 8px;
`;

export default ScenarioWizardModal;
