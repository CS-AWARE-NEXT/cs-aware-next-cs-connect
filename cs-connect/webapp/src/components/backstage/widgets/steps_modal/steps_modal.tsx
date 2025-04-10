import React, {
    ChangeEvent,
    useCallback,
    useContext,
    useState,
} from 'react';
import {
    Button,
    Checkbox,
    Input,
    Modal,
    Steps,
} from 'antd';
import {useRouteMatch} from 'react-router-dom';
import styled from 'styled-components';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';
import {ClientError} from '@mattermost/client';

import {getCurrentUserId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';

import {StepData} from 'src/types/steps_modal';
import {
    formatName,
    formatSectionPath,
    formatStringToCapitalize,
    formatStringToLowerCase,
} from 'src/helpers';
import {useOrganization} from 'src/hooks';
import {addChannel, saveSectionInfo} from 'src/clients';
import {navigateToUrl} from 'src/browser_routing';
import {PARENT_ID_PARAM} from 'src/constants';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import {ErrorMessage, PaddedErrorMessage} from 'src/components/commons/messages';
import {PrimaryButtonLarger} from 'src/components/backstage/widgets/shared';
import {HorizontalSpacer} from 'src/components/backstage/grid';

const {Step} = Steps;

type Props = {
    data: StepData[];
    fields: string[];
    name: string;
    parentId: string;
    targetUrl: string;
};

type SectionInfoState = any;

const StepsModal = ({
    data,
    fields,
    name,
    parentId,
    targetUrl,
}: Props) => {
    const {path} = useRouteMatch();
    const {formatMessage} = useIntl();
    const teamId = useSelector(getCurrentTeamId);
    const userId = useSelector(getCurrentUserId);
    const organizationId = useContext(OrganizationIdContext);
    const organization = useOrganization(organizationId);

    const [visible, setVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [stepValues, setStepValues] = useState<any>({});

    const initSectionInfoState = useCallback<SectionInfoState>(() => {
        const state: SectionInfoState = {};
        fields.forEach((key) => {
            state[key] = '';
        });
        return state;
    }, []);
    const [inputValues, setInputValues] = useState<SectionInfoState>(initSectionInfoState());
    const [errors, setErrors] = useState<SectionInfoState>(initSectionInfoState());

    const cleanModal = useCallback(() => {
        setVisible(false);
        setCurrentStep(0);
        setStepValues({});
        setErrorMessage('');
        setInputValues(initSectionInfoState());
        setErrors(initSectionInfoState());
    }, []);

    const handleInputChange = ({target}: ChangeEvent<HTMLInputElement>, key: string) => {
        setInputValues({...inputValues, [key]: target.value});
        setErrors({...errors, [key]: ''});
    };

    const handleOk = async () => {
        const addRowErrors: SectionInfoState = initSectionInfoState();
        let allKeysNotEmpty = true;
        Object.keys(inputValues).forEach((key) => {
            if (!inputValues[key] || inputValues[key].trim() === '') {
                addRowErrors[key] = `${formatStringToCapitalize(key)} ${formatMessage({defaultMessage: 'is required.'})}`;
                allKeysNotEmpty = false;
            }
        });
        if (!allKeysNotEmpty) {
            setErrors(addRowErrors);
            return;
        }

        // TODO: this function has to be passed as a prop, to make the widget generic
        saveSectionInfo({
            ...inputValues,
            elements: Object.values(stepValues).flat(),
        }, targetUrl).
            then((savedSectionInfo) => {
                addChannel({
                    channelName: formatName(`${organization.name}-${savedSectionInfo.name}`),
                    createPublicChannel: true,
                    parentId,
                    sectionId: savedSectionInfo.id,
                    teamId,
                    userId,
                    organizationId,
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

    const steps = data.map((step) => {
        const title = step.title;
        return {
            title,
            content: (
                <CheckboxGroup
                    onChange={(values) => setStepValues({...stepValues, [title]: values})}
                    value={stepValues[title]}
                >
                    {step.options.map((option, index) => (
                        <OptionsCheckbox
                            key={`${option.name}-${index}`}
                            value={option}
                        >
                            <div>{option.name}</div>
                            <OptionDescription>{option.description}</OptionDescription>
                        </OptionsCheckbox>))}
                </CheckboxGroup>
            ),
        };
    });

    return (
        <Container>
            <ButtonContainer>
                <PrimaryButtonLarger onClick={() => setVisible(true)}>
                    <FormattedMessage defaultMessage='Create'/>
                </PrimaryButtonLarger>
            </ButtonContainer>
            <Modal
                bodyStyle={modalBodyStyle}
                centered={true}
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                title={formatMessage({defaultMessage: 'Create New'})}
                footer={[
                    <Button
                        key='back'
                        onClick={() => setCurrentStep(currentStep - 1)}
                        disabled={currentStep === 0}
                    >
                        <FormattedMessage defaultMessage='Previous'/>
                    </Button>,
                    <Button
                        key='next'
                        onClick={() => setCurrentStep(data.length - 1 === currentStep ? currentStep : currentStep + 1)}
                        disabled={currentStep === steps.length - 1}
                    >
                        <FormattedMessage defaultMessage='Next'/>
                    </Button>,
                    <Button
                        key='submit'
                        type='primary'
                        onClick={handleOk}
                    >
                        <FormattedMessage defaultMessage='Create'/>
                    </Button>,
                ]}
            >
                <ModalBody>
                    {fields.map((key) => (
                        <>
                            <Text>{formatStringToCapitalize(key)}</Text>
                            <TextInput
                                key={key}
                                placeholder={key}
                                value={inputValues[key] || ''}
                                onChange={(e) => handleInputChange(e, key)}
                            />
                            <PaddedErrorMessage
                                display={errors[key] && errors[key] !== ''}
                                marginBottom={'12px'}
                                marginLeft={'0px'}
                            >
                                {errors[key]}
                            </PaddedErrorMessage>
                        </>
                    ))}
                    <OptionSteps
                        current={currentStep}
                        progressDot={true}
                        size='small'
                    >
                        {steps.map((item) => (
                            <Step
                                key={item.title}
                                title={item.title}
                            />))}
                    </OptionSteps>
                    <StepsBody>
                        {steps[currentStep].content}
                    </StepsBody>
                    <HorizontalSpacer size={1}/>
                    <ErrorMessage display={errorMessage !== ''}>
                        {errorMessage}
                    </ErrorMessage>
                </ModalBody>
            </Modal>
        </Container>
    );
};

const modalBodyStyle = {
    height: '500px',
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

const ButtonContainer = styled.div`
    width: 50px;
`;

const TextInput = styled(Input)`
    margin-bottom: 12px;
`;

const Text = styled.div`
    text-align: left;
`;

export const ModalBody = styled.div`
    max-height: 500px;
    overflow-y: auto;
    padding: 8px;
`;

const StepsBody = styled.div`
    /* This is to enable scrolling only on steps
    max-height: 300px;
    overflow-y: auto;
    */
`;

const OptionSteps = styled(Steps)`
    margin: 12px 0 12px 0;
`;

const CheckboxGroup = styled(Checkbox.Group)`
    display: flex;
    flex-direction: column;
`;

const OptionsCheckbox = styled(Checkbox)`
    margin-left: 8px;
    margin-top: 2px;
    margin-bottom: 2px;
    border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
`;

const OptionDescription = styled.div`
    font-size: 12px;
    color: rgba(var(--center-channel-color-rgb), 0.72);
    margin-top: 2px;
`;

export default StepsModal;
