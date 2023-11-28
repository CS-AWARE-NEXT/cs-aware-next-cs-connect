import {
    Button,
    Dropdown,
    MenuProps,
    Tooltip,
} from 'antd';
import React, {
    Dispatch,
    FC,
    ReactNode,
    SetStateAction,
    useContext,
} from 'react';
import styled from 'styled-components';
import {
    CloseOutlined,
    InfoCircleOutlined,
    LinkOutlined,
    NodeIndexOutlined,
} from '@ant-design/icons';
import {FormattedMessage, useIntl} from 'react-intl';

import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {EMPTY_NODE_DESCRIPTION, GraphNodeInfo as NodeInfo} from 'src/types/graph';
import {Spacer, VerticalSpacer} from 'src/components/backstage/grid';
import {Header} from 'src/components/backstage/widgets/shared';
import {IsRhsClosedContext} from 'src/components/rhs/rhs';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';

// TODO: Add node info in chat hyperlinks
const NODE_INFO_ID_PREFIX = 'node-info-';

type Props = {
    info: NodeInfo;
    sectionId: string;
    parentId: string;
    setNodeInfo: Dispatch<SetStateAction<NodeInfo | undefined>>;
};

const textBoxStyle = {
    height: '5vh',
    marginTop: '0px',
};

const GraphNodeInfo: FC<Props> = ({
    info,
    sectionId,
    parentId,
    setNodeInfo,
}) => {
    const {formatMessage} = useIntl();
    const isRhs = useContext(IsRhsContext);
    const isRhsClosed = useContext(IsRhsClosedContext);

    const {name, description} = info;
    return (
        <Container>
            {(!isRhs || !isRhsClosed) && <VerticalSpacer size={34}/>}
            <Header>
                <Spacer/>
                <Tooltip title={formatMessage({defaultMessage: 'Close info'})}>
                    <Button
                        key='close'
                        danger={true}
                        icon={<CloseOutlined/>}
                        onClick={() => setNodeInfo(undefined)}
                    />
                </Tooltip>
            </Header>
            <TextBox
                idPrefix={NODE_INFO_ID_PREFIX}
                name={name}
                sectionId={sectionId}
                parentId={parentId}
                text={description ?? EMPTY_NODE_DESCRIPTION}
                style={textBoxStyle}
            />
            {(isRhs && isRhsClosed) && <VerticalSpacer size={24}/>}
        </Container>
    );
};

type GraphNodeInfoDropdown = {
    onInfoClick: () => void;
    onCopyLinkClick: () => void;
    onViewConnectionsClick: () => void;
    children: ReactNode;
    trigger?: ('contextMenu' | 'click' | 'hover')[] | undefined;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
};

export const GraphNodeInfoDropdown: FC<GraphNodeInfoDropdown> = ({
    onInfoClick,
    onCopyLinkClick,
    onViewConnectionsClick,
    children,
    trigger = ['click'],
    open = false,
    setOpen,
}) => {
    const items: MenuProps['items'] = [
        {
            key: 'copy-link',
            label: (
                <div
                    onClick={onCopyLinkClick}
                >
                    <LinkOutlined/> <FormattedMessage defaultMessage={'Copy link'}/>
                </div>
            ),
        },
        {
            key: 'info',
            label: (
                <div
                    onClick={onInfoClick}
                >
                    <InfoCircleOutlined/> <FormattedMessage defaultMessage={'View info'}/>
                </div>
            ),
        },
        {
            key: 'view-connections',
            label: (
                <div
                    onClick={onViewConnectionsClick}
                >
                    <NodeIndexOutlined/> <FormattedMessage defaultMessage={'View connections'}/>
                </div>
            ),
        },
        {
            key: 'close-menu',
            danger: true,
            label: (
                <div
                    onClick={() => setOpen(false)}
                >
                    <CloseOutlined/> <FormattedMessage defaultMessage={'Close menu'}/>
                </div>
            ),
        },
    ];
    return (
        <Dropdown
            open={open}
            trigger={trigger}
            menu={{items}}
            arrow={{pointAtCenter: true}}
            placement='topLeft'
        >
            {children}
        </Dropdown>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
    margin-bottom: 24px;
`;

export default GraphNodeInfo;
