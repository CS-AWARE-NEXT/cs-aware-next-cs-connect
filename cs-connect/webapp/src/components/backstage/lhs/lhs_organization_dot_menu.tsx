import {DotsVerticalIcon} from '@mattermost/compass-icons/components';
import React from 'react';

import {DEFAULT_PATH, ORGANIZATIONS_PATH} from 'src/constants';
import {CopyLinkMenuItem} from 'src/components/backstage/header/controls';
import DotMenu from 'src/components/commons/dot_menu';
import {DotMenuButtonStyled} from 'src/components/backstage/shared';
import {getSiteUrl} from 'src/clients';

type Props = {
    organizationId: string;
    organizationName: string;
};

export const LHSOrganizationDotMenu = ({organizationId, organizationName}: Props) => {
    return (
        <>
            <DotMenu
                placement='bottom-start'
                icon={(
                    <DotsVerticalIcon
                        size={14.4}
                        color={'var(--button-color)'}
                    />
                )}
                dotMenuButton={DotMenuButtonStyled}
            >
                <CopyLinkMenuItem
                    path={`${getSiteUrl()}/${DEFAULT_PATH}/${ORGANIZATIONS_PATH}/${organizationId}`}
                    text={organizationName}
                />
            </DotMenu>
        </>
    );
};
