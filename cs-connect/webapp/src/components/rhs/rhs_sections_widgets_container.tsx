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
import {useUserProps} from 'src/hooks';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';

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
            console.log('Exporting section', sectionInfo.id, section.url);
            updatePolicyTemplateFieldAction({
                policyId: sectionInfo.id,
                field: 'exported',
                value: 'true',
            }, true);
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
