import React, {useContext, useEffect, useState} from 'react';
import {useRouteMatch} from 'react-router-dom';

import {buildQuery} from 'src/hooks';
import {formatStringToCapitalize} from 'src/helpers';
import SectionsWidgetsContainer from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {archiveIssueChannels, deleteIssue, getSiteUrl} from 'src/clients';
import EcosystemElementsWrapper from 'src/components/backstage/widgets/paginated_table/wrappers/ecosystem_elements_wrapper';
import EcosystemOutcomesWrapper from 'src/components/backstage/widgets/list/wrappers/ecosystem_outcomes_wrapper';
import EcosystemAttachmentsWrapper from 'src/components/backstage/widgets/list/wrappers/ecosystem_attachments_wrapper';
import EcosystemObjectivesWrapper from 'src/components/backstage/widgets/text_box/wrappers/ecosystem_objectives_wrapper';
import EcosystemRolesWrapper from 'src/components/backstage/widgets/paginated_table/wrappers/ecosystem_roles_wrapper';
import {
    ecosystemAttachmentsWidget,
    ecosystemElementsWidget,
    ecosystemObjectivesWidget,
    ecosystemOutcomesWidget,
    ecosystemRolesWidget,
} from 'src/constants';
import {Section, SectionInfo} from 'src/types/organization';
import {navigateToBackstageOrganization} from 'src/browser_routing';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';

type Props = {
    section: Section;
    sectionInfo: SectionInfo;
};

const EcosystemSectionsWidgetsContainer = ({section, sectionInfo}: Props) => {
    const organizationId = useContext(OrganizationIdContext);
    const {url} = useRouteMatch<{sectionId: string}>();
    const [currentSectionInfo, setCurrentSectionInfo] = useState<SectionInfo | undefined>(sectionInfo);
    useEffect(() => {
        setCurrentSectionInfo(sectionInfo);
    }, [sectionInfo]);

    return (
        <SectionsWidgetsContainer
            headerPath={`${getSiteUrl()}${url}?${buildQuery(section.id, '')}#_${currentSectionInfo?.id}`}
            sectionInfo={currentSectionInfo}
            setSectionInfo={setCurrentSectionInfo}
            url={url}
            widgets={section.widgets}
            childrenBottom={false}
            deleteProps={{url: section.url}}
            enableEcosystemEdit={true}
            onDelete={async () => {
                if (currentSectionInfo && section) {
                    await deleteIssue(sectionInfo.id, section.url);
                    await archiveIssueChannels({issueId: currentSectionInfo.id});
                    navigateToBackstageOrganization(organizationId);
                }
            }}
        >
            <EcosystemObjectivesWrapper
                name={formatStringToCapitalize(ecosystemObjectivesWidget)}
                objectives={currentSectionInfo?.objectivesAndResearchArea}
            />
            <EcosystemOutcomesWrapper
                name={formatStringToCapitalize(ecosystemOutcomesWidget)}
                outcomes={currentSectionInfo?.outcomes}
            />
            <EcosystemRolesWrapper
                name={formatStringToCapitalize(ecosystemRolesWidget)}
                roles={currentSectionInfo?.roles}
            />
            <EcosystemElementsWrapper
                name={formatStringToCapitalize(ecosystemElementsWidget)}
                elements={currentSectionInfo?.elements}
            />
            <EcosystemAttachmentsWrapper
                name={formatStringToCapitalize(ecosystemAttachmentsWidget)}
                attachments={currentSectionInfo?.attachments}
            />
        </SectionsWidgetsContainer>
    );
};

export default EcosystemSectionsWidgetsContainer;
