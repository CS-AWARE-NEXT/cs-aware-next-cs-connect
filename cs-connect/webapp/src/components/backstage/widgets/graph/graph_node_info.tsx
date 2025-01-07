import {Dropdown, MenuProps} from 'antd';
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
import {FormattedMessage} from 'react-intl';

import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {EMPTY_NODE_DESCRIPTION, GraphNodeInfo as NodeInfo} from 'src/types/graph';
import {VerticalSpacer} from 'src/components/backstage/grid';
import {IsRhsClosedContext} from 'src/components/rhs/rhs';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';

export const NODE_INFO_ID_PREFIX = 'node-info-';

type Props = {
    info: NodeInfo;
    sectionId: string;
    parentId: string;
    graphName: string;
};

const textBoxStyle = {
    height: '5vh',
    marginTop: '0px',
};

// To add more sections, be sure to also update the suggestions parsers to properly add hyperlinking functionality.
const GraphNodeInfo: FC<Props> = ({
    info,
    sectionId,
    parentId,
    graphName,
}) => {
    const isRhs = useContext(IsRhsContext);
    const isRhsClosed = useContext(IsRhsClosedContext);

    const {description, name} = info;
    return (
        <Container>
            <TextBox
                name={'Description'}
                sectionId={sectionId}
                parentId={parentId}
                text={description ?? EMPTY_NODE_DESCRIPTION}
                style={textBoxStyle}
                customId={`_${info.nodeId}-${sectionId}-${parentId}-${NODE_INFO_ID_PREFIX}-widget`}
                titleText={`${graphName}.${name}.Description`}
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
