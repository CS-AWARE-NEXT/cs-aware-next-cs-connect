import {
    Checkbox,
    CheckboxProps,
    Modal,
    Select,
    message,
} from 'antd';
import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';
import {ModalBody} from 'react-bootstrap';
import {useDispatch, useSelector} from 'react-redux';

import {exportChannel, exportChannelToDatalake, getSectionInfoUrl} from 'src/clients';
import {channelNameSelector, exportChannelSelector} from 'src/selectors';
import {
    buildBaseProviderUrl,
    getUrlWithoutQueryParams,
    useIsSectionFromEcosystem,
    useSection,
    useSectionInfo,
} from 'src/hooks';
import {getSectionById} from 'src/config/config';
import {exportAction} from 'src/actions';

const DEFAULT_FORMAT = 'JSON';

export type ExportReference = {
    source_name: string,
    external_ids: string[],
    urls: string[],
}

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
    const [format, setFormat] = useState(DEFAULT_FORMAT);
    const [pinnedOnly, setPinnedOnly] = useState(false);
    const channel = useSelector(channelNameSelector(exportData?.channelId));
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const section = useSection(parentId);
    const isEcosystem = useIsSectionFromEcosystem(parentId);
    const sectionInfo = useSectionInfo(sectionId, section?.url);

    useEffect(() => {
        if (exportData?.channelId) {
            setOpen(true);
        }
    }, [exportData]);

    const onOk = async () => {
        const references = [{
            source_name: sectionInfo.name,
            external_ids: [sectionInfo.id],
            urls: [getSectionInfoUrl(sectionId, section?.url)],
        }];
        if (isEcosystem && sectionInfo.elements) {
            // Remove elements related to deleted organizations
            const filteredElements = sectionInfo.elements.filter((el: any) => getSectionById(el.parentId) !== undefined);
            references.push({
                source_name: 'support technology data',
                external_ids: filteredElements.map((el: any) => el.id),
                urls: filteredElements.map((el: any) => {
                    const elementSection = getSectionById(el.parentId);
                    return getSectionInfoUrl(el.id, elementSection.url);
                }),
            });
        }

        const channelUrl = getUrlWithoutQueryParams();
        const data = await exportChannel(
            channel.id,
            format,
            pinnedOnly,
            channelUrl,
            references,
        );

        try {
            switch (format) {
            case 'JSON': {
                console.log('exporting in JSON', {data}, section.url);
                message.info('Exporting discussion...');
                const result = await exportChannelToDatalake(buildBaseProviderUrl(section.url), data);
                if (!result.success) {
                    message.error(result.message);
                    break;
                }
                message.success('Discussion exported successfully!');
                break;
            }
            case 'Download': {
                const fileURL = window.URL.createObjectURL(data as Blob);

                // Emulate a click on an anchor to trigger a browser download
                const link = document.createElement('a');
                link.href = fileURL;
                link.download = `${channel.name}.${DEFAULT_FORMAT.toLowerCase()}`;
                link.click();
                setTimeout(() => {
                    URL.revokeObjectURL(fileURL);
                }, 0);
                break;
            }
            default:
                break;
            }
        } finally {
            dispatch(exportAction(''));
            setOpen(false);
        }
    };

    const onCancel = () => {
        setOpen(false);
        dispatch(exportAction(''));
    };

    const onChange: CheckboxProps['onChange'] = (e) => {
        setPinnedOnly(e.target.checked);
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
                <Container>
                    <Text>{'Select the format for the export.'}</Text>
                    <Checkbox
                        onChange={onChange}
                        style={{marginTop: '8px'}}
                    >
                        {'Pinned only (export only important messages)'}
                    </Checkbox>
                    <Select
                        id={'export-select-format'}
                        defaultValue={format}
                        style={{width: 120, marginTop: '8px'}}
                        onChange={(value) => {
                            setFormat(value);
                        }}
                        options={[
                            {value: 'JSON', label: 'JSON/STIX'},
                            {value: 'Download', label: 'Download'},
                        ]}
                    />
                </Container>
            </ModalBody>
        </Modal>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

const Text = styled.div`
    text-align: left;
`;
