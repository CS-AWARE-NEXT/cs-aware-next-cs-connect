/// The following component groups actions that can be performed on hyperlinkable elements (such as copying a link, editing or deleting)

import React, {useContext} from 'react';
import styled from 'styled-components';

import {useIntl} from 'react-intl';

import CopyLink from 'src/components/commons/copy_link';
import DeleteAction from 'src/components/commons/delete_action';
import EditAction from 'src/components/commons/edit_action';
import {Organization, SectionInfo} from 'src/types/organization';

import {HyperlinkPathContext} from 'src/components/rhs/rhs_shared';

type Props = {
    name: string;
    path: string;
    ecosystem: Organization;
    url?: string
    onDelete?: () => void
    enableEdit?: boolean
    sectionInfo?: SectionInfo
    setSectionInfo?: React.Dispatch<React.SetStateAction<SectionInfo | undefined>>
};

export const HyperlinkableActions = ({name, path, ecosystem, url, onDelete, enableEdit = false, sectionInfo, setSectionInfo}: Props) => {
    const {formatMessage} = useIntl();
    const hyperlinkPath = useContext(HyperlinkPathContext);

    return (
        <>
            <StyledCopyLink
                id='copy-name-link-tooltip'
                text={hyperlinkPath}
                to={path}
                tooltipMessage={formatMessage({defaultMessage: 'Copy link'})}
            />
            {(onDelete && url) &&
            <StyledDeleteAction
                id='delete-tooltip'
                modalTitle={formatMessage({defaultMessage: 'Delete issue'})}
                modalContent={formatMessage({defaultMessage: 'Do you really want to delete this issue?'})}
                onDelete={onDelete}
            />}
            {enableEdit &&
            <StyledEditAction
                id='edit-tooltip'
                sectionInfo={sectionInfo}
                setSectionInfo={setSectionInfo}
                ecosystem={ecosystem}
            />}
        </>
    );
};

const StyledCopyLink = styled(CopyLink)`
    border-radius: 4px;
    font-size: 18px;
    width: 28px;
    height: 28px;
    margin-left: 4px;
    display: grid;
    place-items: center;
`;

const StyledDeleteAction = styled(DeleteAction)`
    border-radius: 4px;
    font-size: 18px;
    width: 28px;
    height: 28px;
    margin-left: 4px;
    display: grid;
    place-items: center;
`;

const StyledEditAction = styled(EditAction)`
    border-radius: 4px;
    font-size: 18px;
    width: 28px;
    height: 28px;
    margin-left: 4px;
    display: grid;
    place-items: center;
`;
