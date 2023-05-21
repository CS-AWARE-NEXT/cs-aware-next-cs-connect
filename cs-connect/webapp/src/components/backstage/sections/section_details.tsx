import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {
    buildQuery,
    useForceDocumentTitle,
    useNavHighlighting,
    useScrollIntoView,
    useSection,
    useSectionInfo,
} from 'src/hooks';
import {formatStringToCapitalize} from 'src/helpers';
import SectionsWidgetsContainer from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {getSiteUrl} from 'src/clients';
import {IsEcosystemContext} from 'src/components/backstage/organizations/ecosystem/ecosystem_details';
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

import {SECTION_NAV_ITEM, SECTION_NAV_ITEM_ACTIVE} from './sections';

const SectionDetails = () => {
    const {url, path, params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {hash: urlHash, search} = useLocation();
    const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const section = useSection(parentIdParam);
    const sectionInfo = useSectionInfo(sectionId, section.url);
    const isEcosystem = useContext(IsEcosystemContext);

    useForceDocumentTitle(sectionInfo.name ? (sectionInfo.name) : 'Section');
    useScrollIntoView(urlHash);
    useNavHighlighting(SECTION_NAV_ITEM, SECTION_NAV_ITEM_ACTIVE, section.name, [parentIdParam]);

    // Loading state
    if (!section) {
        return null;
    }

    return (
        isEcosystem ?
            <SectionsWidgetsContainer
                headerPath={`${getSiteUrl()}${url}?${buildQuery(section.id, '')}#_${sectionInfo.id}`}
                sectionInfo={sectionInfo}
                url={url}
                widgets={section.widgets}
                childrenBottom={false}
            >
                <EcosystemObjectivesWrapper
                    name={formatStringToCapitalize(ecosystemObjectivesWidget)}
                    objectives={sectionInfo.objectives_and_research_area}
                />
                <EcosystemOutcomesWrapper
                    name={formatStringToCapitalize(ecosystemOutcomesWidget)}
                    outcomes={sectionInfo.outcomes}
                />
                <EcosystemRolesWrapper
                    name={formatStringToCapitalize(ecosystemRolesWidget)}
                    roles={sectionInfo.roles}
                />
                <EcosystemElementsWrapper
                    name={formatStringToCapitalize(ecosystemElementsWidget)}
                    elements={sectionInfo.elements}
                />
                <EcosystemAttachmentsWrapper
                    name={formatStringToCapitalize(ecosystemAttachmentsWidget)}
                    attachments={sectionInfo.attachments}
                />
            </SectionsWidgetsContainer> :
            <SectionsWidgetsContainer
                headerPath={`${getSiteUrl()}${url}?${buildQuery(section.id, '')}#_${sectionInfo.id}`}
                sectionInfo={sectionInfo}
                sectionPath={path}
                sections={section.sections}
                url={url}
                widgets={section.widgets}
            />
    );
};

export default SectionDetails;