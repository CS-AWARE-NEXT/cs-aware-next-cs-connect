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
import {StepData} from 'src/types/steps_modal';
import {addChannel, saveSectionInfo} from 'src/clients';
import {navigateToUrl} from 'src/browser_routing';
import {formatName, formatSectionPath, formatStringToLowerCase} from 'src/helpers';
import {PARENT_ID_PARAM} from 'src/constants';
import {useOrganization} from 'src/hooks';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import {HorizontalSpacer} from 'src/components/backstage/grid';
import {ErrorMessage} from 'src/components/commons/messages';

import ObjectivesStep from './steps/objectives_step';
import OutcomesStep from './steps/outcomes_step';
import RolesStep from './steps/roles_step';
import TechnologyStep from './steps/technology_step';
import AttachementsStep from './steps/attachements_step';

type Props = {
    organizationsData: StepData[];
    targetUrl: string;
    name: string;
    parentId: string;
};

const ScenarioWizard = ({organizationsData, targetUrl, name, parentId}: Props) => {
    const {formatMessage} = useIntl();
    const {path} = useRouteMatch();
    const teamId = useSelector(getCurrentTeamId);
    const organizationId = useContext(OrganizationIdContext);
    const organization = useOrganization(organizationId);

    const emptyWizardData = useMemo(() => ({
        name: '',
        objectives: '',
        outcomes: [],
        roles: [],
        elements: {},
        attachements: [],
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
        saveSectionInfo({
            name: wizardData.name,
            description: wizardData.objectives,
            elements: Object.values(wizardData.elements).flat(),
        }, targetUrl).
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
                        const basePath = `${formatSectionPath(path, organizationId)}/${formatStringToLowerCase(name)}`;
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
            title: 'Objectives And Research Area',
            content: (
                <ObjectivesStep
                    data={{name: wizardData.name, objectives: wizardData.objectives}}
                    setWizardData={setWizardData}
                />),
        },
        {
            title: 'Outcomes',
            content: (
                <OutcomesStep
                    data={wizardData.outcomes}
                    setWizardData={setWizardData}
                />),
        },
        {
            title: 'Participants And Roles',
            content: (
                <RolesStep
                    data={wizardData.roles}
                    setWizardData={setWizardData}
                />),
        },
        {
            title: 'Support Technology Moderation Manuals',
            content: (
                <TechnologyStep
                    data={wizardData.elements}
                    organizationsData={organizationsData}
                    setWizardData={setWizardData}
                />
            ),
        },
        {
            title: 'Preparation And Planning',
            content: (
                <AttachementsStep
                    data={wizardData.attachements}
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
