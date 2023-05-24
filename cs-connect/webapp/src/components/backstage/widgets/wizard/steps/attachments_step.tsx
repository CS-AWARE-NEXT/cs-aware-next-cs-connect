import {Avatar, Button, List} from 'antd';
import {FileOutlined, LinkOutlined, TagsOutlined} from '@ant-design/icons';
import React, {Dispatch, SetStateAction, useState} from 'react';
import styled from 'styled-components';
import {cloneDeep} from 'lodash';
import {FormattedMessage} from 'react-intl';

import {Attachment} from 'src/types/scenario_wizard';
import {TextInput} from 'src/components/backstage/widgets/shared';

const {Item} = List;
const {Meta} = Item;

type Props = {
    data: string[],
    setWizardData: Dispatch<SetStateAction<any>>,
};

export const fillAttachments = (attachments: string[]): Attachment[] => {
    return attachments.map((attachment) => ({attachment}));
};

const AttachmentsStep = ({data, setWizardData}: Props) => {
    const [attachements, setAttachements] = useState<string[]>(data);

    return (
        <Container>
            <div style={{width: '100%'}}>
                <Button
                    type='primary'
                    icon={<LinkOutlined/>}
                    style={{width: '48%', marginLeft: '1%', marginRight: '1%'}}
                    onClick={() => setAttachements((prev) => ([...prev, '']))}
                >
                    <FormattedMessage defaultMessage='Add a link'/>
                </Button>
                <Button
                    icon={<FileOutlined/>}
                    style={{width: '48%'}}
                    disabled={true}
                >
                    <FormattedMessage defaultMessage='Upload a file'/>
                </Button>
            </div>
            <List
                style={{padding: '16px'}}
                itemLayout='horizontal'
                dataSource={attachements}
                renderItem={(attachement, index) => (
                    <Item>
                        <Meta
                            avatar={<Avatar icon={<TagsOutlined/>}/>}
                            title={(
                                <TextInput
                                    key={`attachment-${index}`}
                                    placeholder={'Insert an attachment'}
                                    value={attachement}
                                    onChange={(e) => {
                                        const currentAttachements = cloneDeep(attachements);
                                        currentAttachements[index] = e.target.value;
                                        setAttachements(currentAttachements);
                                        setWizardData((prev: any) => ({...prev, attachments: currentAttachements}));
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

export default AttachmentsStep;
