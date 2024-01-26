import {Modal, Select} from 'antd';
import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import styled from 'styled-components';

import {ModalBody} from 'react-bootstrap';

import {useSelector} from 'react-redux';

import {exportChannel} from 'src/clients';
import {channelNameSelector, exportChannelSelector} from 'src/selectors';
import {useIsSectionFromEcosystem, useSection, useSectionInfo} from 'src/hooks';

export const ExportButton = () => (
    <FormattedMessage
        defaultMessage='Export'
    />
);

type Props = {
    parentId: string,
    sectionId: string
};

export const Exporter = ({parentId, sectionId}: Props) => {
    const exportData = useSelector(exportChannelSelector);
    const [format, setFormat] = useState('json');
    const channel = useSelector(channelNameSelector(exportData.channelId));
    const [open, setOpen] = useState(false);
    const section = useSection(parentId);
    const isEcosystem = useIsSectionFromEcosystem(parentId);
    const sectionInfo = useSectionInfo(sectionId, section?.url);

    useEffect(() => {
        if (exportData.channelId) {
            setOpen(true);
        }
    }, [exportData]);

    const onOk = async () => {
        const references = [sectionInfo.id];
        if (isEcosystem && sectionInfo.elements) {
            references.push(...sectionInfo.elements.map((el: any) => el.id));
        }
        const data = await exportChannel(channel.id, format, references);
        const fileURL = window.URL.createObjectURL(data);

        // Emulate a click on an anchor to trigger a browser download
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = `${channel.name}.${format}`;
        link.click();
        setTimeout(() => {
            URL.revokeObjectURL(fileURL);
        }, 0);
    };

    const onCancel = () => {
        setOpen(false);
    };

    return (
        <Modal
            title={'Export'}
            onOk={onOk}
            onCancel={onCancel}
            open={open}
            okText={'Export'}
            cancelText={'Cancel'}
            focusTriggerAfterClose={false}
            maskClosable={true}
        >
            <ModalBody>
                <div>
                    <Text>{'Select the format of the exported file.'}</Text>
                    <Select
                        id={'export-select-format'}
                        defaultValue={format}
                        style={{width: 120}}
                        onChange={(value) => {
                            setFormat(value);
                        }}
                        options={[
                            {value: 'json', label: 'JSON/STIX'},
                        ]}
                    />
                </div>
            </ModalBody>
        </Modal>
    );
};

const Text = styled.div`
    text-align: left;
`;
