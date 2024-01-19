import React, {FC, HTMLAttributes} from 'react';
import styled, {css} from 'styled-components';

import {
    Button,
    Card,
    List,
    Modal,
    Space,
} from 'antd';

import {useSelector} from 'react-redux';

import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';

import {FormattedMessage} from 'react-intl';

import {Team} from 'mattermost-webapp/packages/types/src/teams';

import Tooltip from 'src/components/commons/tooltip';
import {OVERLAY_DELAY} from 'src/constants';
import {getBacklinks} from 'src/clients';

import {navigateToPost} from 'src/browser_routing';
import {Timestamp} from 'src/webapp_globals';

import {teamNameSelector} from 'src/selectors';

import {Backlink} from 'src/types/channels';
import MarkdownEdit from 'src/components/commons/markdown_edit';

type Props = {
    href: string;
};

type BacklinkItemProps = {
    backlink: Backlink;
    team: Team;
}

const BacklinkItem = ({backlink, team}: BacklinkItemProps) => {
    return (
        <Card
            title={`${backlink.authorName} | ${backlink.channelName}`}
            extra={
                <Button
                    type={'link'}
                    onClick={() => {
                        navigateToPost(team.name, backlink.id);
                    }}
                >{'Jump'}</Button>}
            style={{width: '100%'}}
        >
            <MarkdownEdit
                value={backlink.message}
                placeholder={''}
                noBorder={true}
                opaqueText={true}
            />
            <StyledTimestamp value={new Date(backlink.createAt)}/>
        </Card>
    );
};

const BacklinksAction: FC<Props & HTMLAttributes<HTMLElement>> = ({href}: Props) => {
    const teamId = useSelector(getCurrentTeamId);
    const team = useSelector(teamNameSelector(teamId));
    const [modal, contextHolder] = Modal.useModal();

    const showModal = async () => {
        // Uncomment to avoid users being able to create infinite overlapping modals when checking a link's backlink from the backlink modal
        // Modal.destroyAll();
        const backlinks = await getBacklinks({elementUrl: href});

        const matchList = (elements: Backlink[]) => (
            <Space
                direction='vertical'
                size={16}
                style={{width: '100%'}}
            >
                <List
                    pagination={{position: 'bottom', align: 'start', defaultPageSize: 3, showSizeChanger: true, pageSizeOptions: [3, 5, 10]}}
                    dataSource={elements}
                    renderItem={(item: Backlink) => (
                        <Space
                            direction='vertical'
                            size={16}
                            style={{width: '100%'}}
                        >
                            <BacklinkItem
                                key={`backlink-${item.id}`}
                                backlink={item}
                                team={team}
                            />
                        </Space>
                    )}
                />
            </Space>
        );

        const content = matchList(backlinks.items);

        modal.info({
            title: 'Backlinks',
            content,
            focusTriggerAfterClose: false,
            maskClosable: true,
            width: '90vw', // double than the default
            //bodyStyle: {minHeight: '80vh'}, useful to avoid going to a page with less than 3 elements and seeing the modal getting resized, but a static height gives worse aesthetic effects
        });
    };

    return (
        <>
            <Tooltip
                id={'backlink-test'}
                placement='bottom'
                delay={OVERLAY_DELAY}
                shouldUpdatePosition={true}
                content={'Backlinks'}
            >
                <AutoSizeBacklinksIcon
                    onClick={showModal}
                    clicked={false}
                    className={'icon-timeline-text-outline'}
                    iconWidth={'28px'}
                    iconHeight={'28px'}
                />
            </Tooltip>
            <FormattedMessage
                defaultMessage='Show backlinks'
            />
            {contextHolder}
        </>
    );
};

const BacklinksIcon = styled.button<{clicked: boolean, iconWidth?: string, iconHeight?: string}>`
    display: inline-block;

    border-radius: 4px;
    padding: 0;
    margin-right: 5px;
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

const StyledTimestamp = styled(Timestamp)`
        opacity: 0.6;
        font-size: .9em;
`;

export const AutoSizeBacklinksIcon = styled(BacklinksIcon)`
    font-size: inherit;
`;

export default styled(BacklinksAction)``;
