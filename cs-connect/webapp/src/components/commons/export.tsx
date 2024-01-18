import {Modal, Select} from 'antd';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import styled from 'styled-components';

import {exportChannel} from 'src/clients';

export const ExportButton = () => (
    <FormattedMessage
        defaultMessage='Export'
    />
);

export const exportAction = async (channel: any) => {
    let format = 'json';

    const exportFormatSelect = () => (
        <div>
            <Text>{'Select the format of the exported file.'}</Text>
            <Select
                id={'export-select-format'}
                defaultValue={format}
                style={{width: 120}}
                onChange={(value) => {
                    format = value;
                }}
                options={[
                    {value: 'json', label: 'JSON/STIX'},
                ]}
            />
        </div>

    );

    const onOk = async () => {
        const data = await exportChannel(channel.id, format);
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

    Modal.confirm({
        title: 'Export',
        content: exportFormatSelect(),
        onOk,
        okText: 'Export',
        cancelText: 'Cancel',
        focusTriggerAfterClose: false,
        maskClosable: true,
    });
};

const Text = styled.div`
    text-align: left;
`;
