import React, {
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import {Button, Modal, Steps} from 'antd';
import styled from 'styled-components';
import {FormattedMessage, useIntl} from 'react-intl';
import {ClientError} from 'mattermost-webapp/packages/client/src';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';
import {useSelector} from 'react-redux';
import {useRouteMatch} from 'react-router-dom';

import {PrimaryButtonLarger} from 'src/components/backstage/widgets/shared';
import {addChannel, saveSectionInfo} from 'src/clients';
import {navigateToUrl} from 'src/browser_routing';
import {formatName, formatSectionPath, formatStringToCapitalize} from 'src/helpers';
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
import {ElementData} from 'src/types/scenario_wizard';

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
};

const ScenarioWizard = ({
    organizationsData,
    name,
    parentId,
    targetUrl,
}: Props) => {
    const {formatMessage} = useIntl();
    const {path} = useRouteMatch();
    const teamId = useSelector(getCurrentTeamId);
    const organizationId = useContext(OrganizationIdContext);
    const organization = useOrganization(organizationId);

    // TODO: define a type for wizard data
    const emptyWizardData = useMemo(() => ({
        name: '',
        objectives: '',
        outcomes: [],
        roles: [],
        elements: {},
        attachments: [],
    }), []);

    const [errorMessage, setErrorMessage] = useState('');
    const [current, setCurrent] = useState(0);
    const [visible, setVisible] = useState(false);
    const [wizardData, setWizardData] = useState(emptyWizardData);

    const cleanModal = useCallback(() => {
        setVisible(false);
        setCurrent(0);
        setWizardData(emptyWizardData);
        setErrorMessage('');
    }, []);

    const handleOk = async () => {
        const issue: SectionInfo = {
            id: '',
            name: wizardData.name,
            objectives_and_research_area: wizardData.objectives,
            outcomes: fillOutcomes(wizardData.outcomes),
            elements: Object.values(wizardData.elements).flat(),
            roles: wizardData.roles,
            attachments: fillAttachments(wizardData.attachments),
        };
        saveSectionInfo(issue, targetUrl).
            then((savedSectionInfo) => {
                addChannel({
                    channelName: formatName(`${organization.name}-${savedSectionInfo.name}`),
                    createPublicChannel: true,
                    parentId,
                    sectionId: savedSectionInfo.id,
                    teamId,
                }).
                    then(() => {
                        cleanModal();
                        const basePath = `${formatSectionPath(path, organizationId)}/${formatName(name)}`;
                        navigateToUrl(`${basePath}/${savedSectionInfo.id}?${PARENT_ID_PARAM}=${parentId}`);
                    });
            }).
            catch((err: ClientError) => {
                const message = JSON.parse(err.message);
                setErrorMessage(message.error);
            });
    };

    const handleCancel = () => {
        cleanModal();
    };

    const steps = [
        {
            title: formatStringToCapitalize(ecosystemObjectivesWidget),
            content: (
                <ObjectivesStep
                    data={{name: wizardData.name, objectives: wizardData.objectives}}
                    setWizardData={setWizardData}
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

    const items = steps.map(({title}) => ({key: title, title}));

    return (
        <Container>
            <ButtonContainer>
                <PrimaryButtonLarger onClick={() => setVisible(true)}>
                    <FormattedMessage defaultMessage='Create'/>
                </PrimaryButtonLarger>
            </ButtonContainer>
            <Modal
                width={'80vw'}
                centered={true}
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                title={formatMessage({defaultMessage: 'Create New'})}
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
                        <FormattedMessage defaultMessage='Create'/>
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
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

const ButtonContainer = styled.div`
    width: 50px;
`;

const ModalBody = styled.div`
    max-height: 80vh;
    overflow-y: auto;
    padding: 8px;
`;

export default ScenarioWizard;
