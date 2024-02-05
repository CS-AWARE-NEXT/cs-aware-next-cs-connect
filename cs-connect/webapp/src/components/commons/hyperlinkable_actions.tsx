/// The following component groups actions that can be performed on hyperlinkable elements (such as copying a link, editing or deleting)

import React, {useContext} from 'react';
import styled from 'styled-components';

import {useIntl} from 'react-intl';

import CopyLink from 'src/components/commons/copy_link';
import DeleteAction from 'src/components/commons/delete_action';
import EcosystemIssueEditAction from 'src/components/commons/ecosystem_issue_edit_action';
import ExportAction from 'src/components/commons/export_action';
import {Organization, SectionInfo} from 'src/types/organization';

import {HyperlinkPathContext} from 'src/components/rhs/rhs_shared';

type Props = {
    name: string;
    path: string;
    ecosystem: Organization;
    url?: string;
    onDelete?: () => void;
    onExport?: () => void;
    enableEcosystemEdit?: boolean;
    sectionInfo?: SectionInfo;
    setSectionInfo?: React.Dispatch<React.SetStateAction<SectionInfo | undefined>>;
};

export const HyperlinkableActions = ({
    name,
    path,
    ecosystem,
    url,
    onDelete,
    onExport,
    enableEcosystemEdit = false,
    sectionInfo,
    setSectionInfo,
}: Props) => {
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
            {enableEcosystemEdit &&
            <StyledEcosystemIssueEditAction
                id='edit-tooltip'
                sectionInfo={sectionInfo}
                setSectionInfo={setSectionInfo}
                ecosystem={ecosystem}
            />}
            {(onExport && url) &&
                <StyledExportAction
                    id='export-tooltip'
                    modalTitle={formatMessage({defaultMessage: 'Export'})}
                    modalContent={formatMessage({defaultMessage: 'Are you sure you want to export?'})}
                    onExport={onExport}
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

const StyledExportAction = styled(ExportAction)`
    border-radius: 4px;
    font-size: 18px;
    width: 28px;
    height: 28px;
    margin-left: 4px;
    display: grid;
    place-items: center;
`;

const StyledEcosystemIssueEditAction = styled(EcosystemIssueEditAction)`
    border-radius: 4px;
    font-size: 18px;
    width: 28px;
    height: 28px;
    margin-left: 4px;
    display: grid;
    place-items: center;
`;
