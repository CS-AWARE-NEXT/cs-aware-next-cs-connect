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

import {StepData} from 'src/types/steps_modal';
import {
    formatName,
    formatSectionPath,
    formatStringToCapitalize,
    formatStringToLowerCase,
    useOrganization,
} from 'src/hooks';
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
                <Checkbox.Group
                    onChange={(values) => setStepValues({...stepValues, [title]: values})}
                    value={stepValues[title]}
                    style={{display: 'flex', flexDirection: 'column', overflowY: 'scroll'}}
                >
                    {step.options.map((option, index) => (
                        <Checkbox
                            key={`${option.name}-${index}`}
                            value={option}
                            style={{marginLeft: '8px', marginTop: '2px', marginBottom: '2px', borderBottom: '1px solid rgba(var(--center-channel-color-rgb), 0.08)'}}
                        >
                            <div>{option.name}</div>
                            <div style={{fontSize: '12px', color: 'rgba(var(--center-channel-color-rgb), 0.72)', marginTop: '2px'}}>
                                {option.description}
                            </div>
                        </Checkbox>))}
                </Checkbox.Group>
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
                centered={true}
                open={visible}
                onOk={handleOk}
                onCancel={handleCancel}
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
                <Steps
                    current={currentStep}
                    progressDot={true}
                    size='small'
                    style={{margin: '12px 0 12px 0'}}
                >
                    {steps.map((item) => (
                        <Step
                            key={item.title}
                            title={item.title}
                        />))}
                </Steps>
                {steps[currentStep].content}
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

const TextInput = styled(Input)`
    margin-bottom: 12px;
`;

const Text = styled.div`
    text-align: left;
`;

export default StepsModal;
