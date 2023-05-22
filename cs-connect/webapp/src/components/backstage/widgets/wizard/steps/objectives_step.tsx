import {Input} from 'antd';
import React, {Dispatch, SetStateAction, useState} from 'react';
import styled from 'styled-components';

import {TextInput} from 'src/components/backstage/widgets/shared';

const {TextArea} = Input;

type Props = {
    data: any;
    setWizardData: Dispatch<SetStateAction<any>>;
};

const ObjectivesStep = ({data, setWizardData}: Props) => {
    const [name, setName] = useState(data.name);
    const [objectives, setObjectives] = useState(data.objectives);

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
                }}
            />
            {/* <PaddedErrorMessage
                display={errors[key] && errors[key] !== ''}
                marginBottom={'12px'}
                marginLeft={'0px'}
            >
                {errors[key]}
            </PaddedErrorMessage> */}
            <Text>{'Objectives And Research Area'}</Text>
            <TextArea
                style={{minHeight: '20vh'}}
                key={'objectives'}
                placeholder={'Insert objectives and research area'}
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
