import styled, {css} from 'styled-components';
import React from 'react';
import {useIntl} from 'react-intl';

import {PrimaryButton, TertiaryButton} from 'src/components/assets/buttons';

import {SemiBoldHeading} from 'src/styles/headings';
import TextEdit from 'src/components/commons/text_edit';

import {Organization, SectionInfo} from 'src/types/organization';

import {HyperlinkableActions} from 'src/components/commons/hyperlinkable_actions';

import {ContextMenu} from './context_menu';

type Props = {
    id: string;
    name: string;
    path: string;
    ecosystem: Organization;
    url?: string
    onDelete?: () => void
    enableEdit?: boolean
    sectionInfo?: SectionInfo
    setSectionInfo?: React.Dispatch<React.SetStateAction<SectionInfo | undefined>>
};

export const NameHeader = ({id, name, path, ecosystem, url, onDelete, enableEdit = false, sectionInfo, setSectionInfo}: Props) => {
    const {formatMessage} = useIntl();

    return (
        <Container
            id={`_${id}`}
            data-testid={`_${id}`}
        >
            <TextEdit
                disabled={false}
                placeholder={formatMessage({defaultMessage: 'Name'})}
                value={name}
                editStyles={css`
                            input {
                                ${titleCommon}
                                height: 36px;
                                width: 240px;
                            }
                            ${PrimaryButton}, ${TertiaryButton} {
                                height: 36px;
                            }
                        `}
            >
                <>
                    <ContextMenu
                        name={name}
                        path={path}
                    />
                    <HyperlinkableActions
                        name={name}
                        path={path}
                        ecosystem={ecosystem}
                        url={url}
                        onDelete={onDelete}
                        enableEdit={enableEdit}
                        sectionInfo={sectionInfo}
                        setSectionInfo={setSectionInfo}
                    />
                </>
            </TextEdit>
        </Container>
    );
};

const Container = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 14px 0 20px;

    box-shadow: inset 0px -1px 0px rgba(var(--center-channel-color-rgb), 0.16);
`;

const titleCommon = css`
    ${SemiBoldHeading}
    font-size: 16px;
    line-height: 24px;
    color: var(--center-channel-color);
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    box-shadow: inset 0 0 0 1px rgba(var(--center-channel-color-rgb), 0.16);
`;
