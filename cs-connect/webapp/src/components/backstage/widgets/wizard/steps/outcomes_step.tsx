import {Avatar, List} from 'antd';
import {UnorderedListOutlined} from '@ant-design/icons';
import React, {Dispatch, SetStateAction, useState} from 'react';
import styled from 'styled-components';
import {cloneDeep} from 'lodash';
import {FormattedMessage} from 'react-intl';

import {PrimaryButtonLarger, TextInput} from 'src/components/backstage/widgets/shared';
import {Outcome} from 'src/types/scenario_wizard';
import {AutoSizeDeleteIcon} from 'src/components/commons/delete_action';

const {Item} = List;
const {Meta} = Item;

type Props = {
    data: string[],
    setWizardData: Dispatch<SetStateAction<any>>,
};

export const fillOutcomes = (outcomes: string[]): Outcome[] => {
    return outcomes.
        filter((outcome) => outcome !== '').
        map((outcome) => ({outcome}));
};

const OutcomesStep = ({data, setWizardData}: Props) => {
    const [outcomes, setOutcomes] = useState<string[]>(data || []);

    return (
        <Container>
            <PrimaryButtonLarger
                onClick={() => setOutcomes((prev) => ([...prev, '']))}
            >
                <FormattedMessage defaultMessage='Add an outcome'/>
            </PrimaryButtonLarger>
            <List
                style={{padding: '16px'}}
                itemLayout='horizontal'
                dataSource={outcomes}
                renderItem={(outcome, index) => (
                    <Item
                        actions={[
                            <StyledDeleteAction
                                key={`outcome-${index}-delete`}
                                onClick={() => {
                                    const currentOutcomes = [...outcomes.filter((prevOutcome) => prevOutcome !== outcome)];
                                    setOutcomes(currentOutcomes);
                                    setWizardData((prev: any) => ({...prev, outcomes: currentOutcomes}));
                                }}
                                className={'icon-trash-can-outline'}
                                clicked={false}
                            />,
                        ]}
                    >
                        <Meta
                            avatar={<Avatar icon={<UnorderedListOutlined/>}/>}
                            title={(
                                <TextInput
                                    key={`outcome-${index}`}
                                    placeholder={'Insert an outcome'}
                                    value={outcome}
                                    onChange={(e) => {
                                        const currentOutcomes = cloneDeep(outcomes);
                                        currentOutcomes[index] = e.target.value;
                                        setOutcomes(currentOutcomes);
                                        setWizardData((prev: any) => ({...prev, outcomes: currentOutcomes}));
                                    }}
                                />)}
                        />
                    </Item>
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

const StyledDeleteAction = styled(AutoSizeDeleteIcon)`
    border-radius: 4px;
    font-size: 18px;
    width: 28px;
    height: 28px;
    margin-left: 4px;
    display: grid;
    place-items: center;
`;

export default OutcomesStep;
