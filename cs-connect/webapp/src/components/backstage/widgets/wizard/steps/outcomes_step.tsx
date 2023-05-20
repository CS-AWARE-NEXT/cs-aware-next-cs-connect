import {Avatar, List} from 'antd';
import {UnorderedListOutlined} from '@ant-design/icons';
import React, {Dispatch, SetStateAction, useState} from 'react';
import styled from 'styled-components';
import {cloneDeep} from 'lodash';
import {FormattedMessage} from 'react-intl';

import {PrimaryButtonLarger} from 'src/components/backstage/widgets/shared';

import {TextInput} from './objectives_step';

type Props = {
    data: string[],
    setWizardData: Dispatch<SetStateAction<any>>,
};

const OutcomesStep = ({data, setWizardData}: Props) => {
    const [outcomes, setOutcomes] = useState<string[]>(data);

    return (
        <Container>
            <PrimaryButtonLarger
                onClick={() => setOutcomes((prev) => ([...prev, '']))}
            >
                <FormattedMessage defaultMessage='Add a new outcome'/>
            </PrimaryButtonLarger>
            <List
                style={{padding: '16px'}}
                itemLayout='horizontal'
                dataSource={outcomes}
                renderItem={(outcome, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={<UnorderedListOutlined/>}/>}
                        />
                        <TextInput
                            key={'outcome'}
                            placeholder={'Insert a new outcome'}
                            value={outcome}
                            onChange={(e) => {
                                const currentOutcomes = cloneDeep(outcomes);
                                currentOutcomes[index] = e.target.value;
                                setOutcomes(currentOutcomes);
                                setWizardData((prev: any) => ({...prev, outcomes: currentOutcomes}));
                            }}
                        />
                    </List.Item>
                )}
            />
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default OutcomesStep;
