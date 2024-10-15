import {Avatar, Button, List} from 'antd';
import {LinkOutlined, TagsOutlined} from '@ant-design/icons';
import React, {Dispatch, SetStateAction, useState} from 'react';
import styled from 'styled-components';
import {cloneDeep} from 'lodash';
import {FormattedMessage} from 'react-intl';

import {Attachment} from 'src/types/scenario_wizard';
import {TextInput} from 'src/components/backstage/widgets/shared';
import {AutoSizeDeleteIcon} from 'src/components/commons/delete_action';

const {Item} = List;
const {Meta} = Item;

type Props = {
    data: string[],
    setWizardData: Dispatch<SetStateAction<any>>,
};

export const fillAttachments = (attachments: string[]): Attachment[] => {
    return attachments.
        filter((attachment) => attachment !== '').
        map((attachment) => ({attachment}));
};

const AttachmentsStep = ({data, setWizardData}: Props) => {
    const [attachments, setAttachments] = useState<string[]>(data || []);

    return (
        <Container>
            <div style={{width: '100%'}}>
                <Button
                    type='primary'
                    icon={<LinkOutlined/>}

                    // style={{width: '48%', marginLeft: '1%', marginRight: '1%'}}
                    style={{width: '98%', marginLeft: '1%', marginRight: '1%'}}
                    onClick={() => setAttachments((prev) => ([...prev, '']))}
                >
                    <FormattedMessage defaultMessage='Add a link'/>
                </Button>

                {/* <Button
                    icon={<FileOutlined/>}
                    style={{width: '48%'}}
                    disabled={true}
                >
                    <FormattedMessage defaultMessage='Upload a file'/>
                </Button> */}
            </div>
            <List
                style={{padding: '16px'}}
                itemLayout='horizontal'
                dataSource={attachments}
                renderItem={(attachment, index) => (
                    <Item
                        actions={[
                            <StyledDeleteAction
                                key={`attachment-${index}-delete`}
                                onClick={() => {
                                    const currentAttachments = [...attachments.filter((prevAttachment) => prevAttachment !== attachment)];
                                    setAttachments(currentAttachments);
                                    setWizardData((prev: any) => ({...prev, attachments: currentAttachments}));
                                }}
                                className={'icon-trash-can-outline'}
                                clicked={false}
                            />,
                        ]}
                    >
                        <Meta
                            avatar={<Avatar icon={<TagsOutlined/>}/>}
                            title={(
                                <TextInput
                                    key={`attachment-${index}`}
                                    placeholder={'Insert an attachment'}
                                    value={attachment}
                                    onChange={(e) => {
                                        const currentAttachments = cloneDeep(attachments);
                                        currentAttachments[index] = e.target.value;
                                        setAttachments(currentAttachments);
                                        setWizardData((prev: any) => ({...prev, attachments: currentAttachments}));
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

export default AttachmentsStep;
