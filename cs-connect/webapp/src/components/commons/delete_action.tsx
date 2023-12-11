import React, {FC, HTMLAttributes} from 'react';
import {useIntl} from 'react-intl';
import styled, {css} from 'styled-components';

import {Modal} from 'antd';

import Tooltip from 'src/components/commons/tooltip';
import {OVERLAY_DELAY} from 'src/constants';

type Props = {
    id: string;
    name: string;
    iconWidth?: string;
    iconHeight?: string;
    onDelete: () => void;
};

type Attrs = HTMLAttributes<HTMLElement>;

// Might be worth merging with copylink since the two act in a very similar way
const DeleteAction: FC<Props & Attrs> = ({
    iconWidth,
    iconHeight,
    id,
    name,
    onDelete,
    ...attrs
}) => {
    const {formatMessage} = useIntl();

    const deleteAction = async () => {
        onDelete();
    };

    const showModal = () => {
        Modal.confirm({
            title: formatMessage({defaultMessage: 'Delete issue'}),
            content: formatMessage({defaultMessage: 'Do you really want to delete this issue?'}),
            onOk: deleteAction,
            okText: formatMessage({defaultMessage: 'Yes'}),
            cancelText: formatMessage({defaultMessage: 'No'}),
            focusTriggerAfterClose: false,
        });
    };

    return (
        <>
            <Tooltip
                id={id}
                placement='bottom'
                delay={OVERLAY_DELAY}
                shouldUpdatePosition={true}
                content={formatMessage({defaultMessage: 'Delete issue'})}
            >
                <AutoSizeDeleteIcon
                    onClick={showModal}
                    clicked={false}
                    {...attrs}
                    className={'icon-trash-can-outline ' + attrs.className}
                    iconWidth={iconWidth}
                    iconHeight={iconHeight}
                />
            </Tooltip>
        </>
    );
};

const DeleteIcon = styled.button<{clicked: boolean, iconWidth?: string, iconHeight?: string}>`
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

const AutoSizeDeleteIcon = styled(DeleteIcon)`
    font-size: inherit;
`;

export default styled(DeleteAction)``;
