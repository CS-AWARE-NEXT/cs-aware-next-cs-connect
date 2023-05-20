import {Avatar, Button, List} from 'antd';
import {FileOutlined, LinkOutlined, TagsOutlined} from '@ant-design/icons';
import React, {Dispatch, SetStateAction, useState} from 'react';
import styled from 'styled-components';
import {cloneDeep} from 'lodash';
import {FormattedMessage} from 'react-intl';

import {TextInput} from './objectives_step';

type Props = {
    data: string[],
    setWizardData: Dispatch<SetStateAction<any>>,
};

const AttachedsStep = ({data, setWizardData}: Props) => {
    const [attacheds, setAttacheds] = useState<string[]>(data);

    return (
        <Container>
            <div style={{width: '100%'}}>
                <Button
                    style={{width: '48%', margin: '2%'}}
                    icon={<LinkOutlined/>}
                    type='primary'
                    onClick={() => setAttacheds((prev) => ([...prev, '']))}
                >
                    <FormattedMessage defaultMessage='Add a new link'/>
                </Button>
                <Button
                    style={{width: '48%'}}
                    disabled={true}
                    icon={<FileOutlined/>}
                    type='primary'
                >
                    <FormattedMessage defaultMessage='Upload a new file'/>
                </Button>
            </div>
            <List
                style={{padding: '16px'}}
                itemLayout='horizontal'
                dataSource={attacheds}
                renderItem={(attached, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={<TagsOutlined/>}/>}
                        />
                        <TextInput
                            key={'attachment'}
                            placeholder={'Insert a new attachment'}
                            value={attached}
                            onChange={(e) => {
                                const currentAttacheds = cloneDeep(attacheds);
                                currentAttacheds[index] = e.target.value;
                                setAttacheds(currentAttacheds);
                                setWizardData((prev: any) => ({...prev, attacheds: currentAttacheds}));
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

export default AttachedsStep;
