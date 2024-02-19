import React, {FC, HTMLAttributes} from 'react';
import {useIntl} from 'react-intl';
import styled, {css} from 'styled-components';

import {Modal} from 'antd';

import Tooltip from 'src/components/commons/tooltip';
import {OVERLAY_DELAY} from 'src/constants';

type Props = {
    id: string;
    modalTitle: string;
    modalContent: string;
    iconWidth?: string;
    iconHeight?: string;
    onExport: () => void;
};

type Attrs = HTMLAttributes<HTMLElement>;

// Might be worth merging with copylink since the two act in a very similar way
const ExportAction: FC<Props & Attrs> = ({
    iconWidth,
    iconHeight,
    id,
    modalTitle,
    modalContent,
    onExport,
    ...attrs
}) => {
    const {formatMessage} = useIntl();

    const exportAction = async () => {
        onExport();
    };

    const showModal = () => {
        Modal.confirm({
            title: modalTitle,
            content: modalContent,
            onOk: exportAction,
            okText: formatMessage({defaultMessage: 'Yes'}),
            cancelText: formatMessage({defaultMessage: 'No'}),
            focusTriggerAfterClose: false,
            width: '512px',
        });
    };

    return (
        <>
            <Tooltip
                id={id}
                placement='bottom'
                delay={OVERLAY_DELAY}
                shouldUpdatePosition={true}
                content={modalTitle}
            >
                <AutoSizeExportIcon
                    onClick={showModal}
                    clicked={false}
                    {...attrs}
                    className={'fa fa-share-square-o ' + attrs.className}
                    iconWidth={iconWidth}
                    iconHeight={iconHeight}
                />
            </Tooltip>
        </>
    );
};

const ExportIcon = styled.button<{clicked: boolean, iconWidth?: string, iconHeight?: string}>`
    display: inline-block;

    border-radius: 4px;
    padding: 0;
    width: ${(props) => (props.iconWidth ? props.iconWidth : '1.5em')};
    height: ${(props) => (props.iconHeight ? props.iconHeight : '1.5em')};

    :before {
        margin: 0;
        vertical-align: baseline;
    }

    border: none;
    background: transparent;
    color: rgba(var(--center-channel-color-rgb), 0.56);


    ${({clicked}) => !clicked && css`
        &:hover {
            background: var(--center-channel-color-08);
            color: var(--center-channel-color-72);
        }
    `}

    ${({clicked}) => clicked && css`
        background: var(--button-bg-08);
        color: var(--button-bg);
    `}
`;

export const AutoSizeExportIcon = styled(ExportIcon)`
    font-size: inherit;
`;

export default styled(ExportAction)``;
