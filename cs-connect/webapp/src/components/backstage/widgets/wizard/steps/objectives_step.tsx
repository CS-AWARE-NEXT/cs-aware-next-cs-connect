import {Input} from 'antd';
import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useState,
} from 'react';
import styled from 'styled-components';

import {TextInput} from 'src/components/backstage/widgets/shared';
import {PaddedErrorMessage} from 'src/components/commons/messages';

const {TextArea} = Input;

type Props = {
    data: any;
    setWizardData: Dispatch<SetStateAction<any>>;
    errorData: any;
    setWizardDataError: Dispatch<SetStateAction<any>>;
};

const ObjectivesStep = ({
    data,
    setWizardData,
    errorData,
    setWizardDataError,
}: Props) => {
    const [name, setName] = useState(data.name);
    const [objectives, setObjectives] = useState(data.objectives);

    useEffect(() => {
        // Force re-rendering to be sure modal is cleaned after being closed
        setName(data.name);
        setObjectives(data.objectives);
    }, [data.name, data.objectives]);

    return (
        <Container>
            <Text>{'Name'}</Text>
            <TextInput
                key={'name'}
                placeholder={'Insert a name'}
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    setWizardData((prev: any) => ({...prev, name: e.target.value}));
                    setWizardDataError((prev: any) => ({...prev, nameError: ''}));
                }}
            />
            <PaddedErrorMessage
                display={errorData.nameError && errorData.nameError !== ''}
                marginBottom={'12px'}
                marginLeft={'0px'}
            >
                {errorData.nameError}
            </PaddedErrorMessage>
            <Text>{'Summary Of Event and Questions For Ecosystem'}</Text>
            <TextArea
                style={{minHeight: '20vh'}}
                key={'objectives'}
                placeholder={'Insert summary of event and questions for ecosystem'}
                value={objectives}
                onChange={(e) => {
                    setObjectives(e.target.value);
                    setWizardData((prev: any) => ({...prev, objectives: e.target.value}));
                }}
            />
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

const Text = styled.div`
    text-align: left;
`;

export default ObjectivesStep;
