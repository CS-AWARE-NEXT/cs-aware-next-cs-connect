import React, {useContext} from 'react';

import SectionsWidgetsContainer from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {
    ORGANIZATION_ID_ALL,
    Section,
    SectionInfo,
    Widget,
} from 'src/types/organization';
import {useToaster} from 'src/components/backstage/toast_banner';
import {updatePolicyTemplateFieldAction} from 'src/actions';
import {RefreshContext} from 'src/components/backstage/sections/section_details';
import {useOrganization, useUserProps} from 'src/hooks';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import {ToastStyle} from 'src/components/backstage/toast';

type Props = {
    headerPath: string;
    sectionInfo: SectionInfo;
    section: Section;
    url: string;
    widgets: Widget[];
};

const RhsSectionsWidgetsContainer = (props: Props) => {
    const {sectionInfo, section, ...restProps} = props;
    const {add: addToast} = useToaster();
    const organizationId = useContext(OrganizationIdContext);
    const organization = useOrganization(organizationId);
    const [userProps, _setUserProps] = useUserProps();

    let enableActions = false;
    const isSectionInternal = section && section.internal;
    const isUserFromOrganization = userProps && (userProps.orgId === organizationId || userProps.orgId === ORGANIZATION_ID_ALL);
    if (isSectionInternal && isUserFromOrganization) {
        enableActions = true;
    }

    const {refresh, forceRefresh} = useContext(RefreshContext);

    const onExport = async () => {
        if (sectionInfo && section) {
            const result = await updatePolicyTemplateFieldAction(
                {
                    policyId: sectionInfo.id,
                    field: 'exported',
                    value: 'true',
                },
                organization.name,
                true
            );
            if (!result.success) {
                addToast({content: result.message, toastStyle: ToastStyle.Failure});
                return;
            }
            if (forceRefresh) {
                forceRefresh();
            }
            addToast({content: 'Work in Progress!'});
        }
    };

    return (
        <SectionsWidgetsContainer
            {...restProps}
            sectionInfo={sectionInfo}
            isRhs={true}
            onExport={enableActions ? onExport : undefined}
            actionProps={enableActions ? {url: section.url} : undefined}
        />
    );
};

export default RhsSectionsWidgetsContainer;
