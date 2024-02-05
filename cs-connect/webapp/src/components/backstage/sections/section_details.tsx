import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {
    buildQuery,
    useForceDocumentTitle,
    useNavHighlighting,
    useOrganization,
    useScrollIntoView,
    useSection,
    useSectionInfo,
} from 'src/hooks';
import SectionsWidgetsContainer from 'src/components/backstage/sections_widgets/sections_widgets_container';
import EcosystemSectionsWidgetsContainer from 'src/components/backstage//sections_widgets/ecosystem_sections_widgets_container';
import {getSiteUrl} from 'src/clients';
import {IsEcosystemContext} from 'src/components/backstage/organizations/ecosystem/ecosystem_details';

import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';

import {HyperlinkPathContext} from 'src/components/rhs/rhs_shared';

import {SECTION_NAV_ITEM, SECTION_NAV_ITEM_ACTIVE} from './sections';

const SectionDetails = () => {
    const {url, path, params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {hash: urlHash, search} = useLocation();
    const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const section = useSection(parentIdParam);
    const sectionInfo = useSectionInfo(sectionId, section.url);
    const isEcosystem = useContext(IsEcosystemContext);
    const organizationId = useContext(OrganizationIdContext);
    const organization = useOrganization(organizationId);
    const hyperlinkPath = (organization && section && sectionInfo) ? `${organization.name}.${section.name}.${sectionInfo.name}` : '';

    useForceDocumentTitle(sectionInfo.name ? (sectionInfo.name) : 'Section');
    useScrollIntoView(urlHash);
    useNavHighlighting(SECTION_NAV_ITEM, SECTION_NAV_ITEM_ACTIVE, section.name, [parentIdParam]);

    // Loading state
    if (!section) {
        return null;
    }

    return (
        (isEcosystem) ? <HyperlinkPathContext.Provider value={hyperlinkPath}>
            <EcosystemSectionsWidgetsContainer
                section={section}
                sectionInfo={sectionInfo}
            />
        </HyperlinkPathContext.Provider> : <HyperlinkPathContext.Provider value={hyperlinkPath}>
            <SectionsWidgetsContainer
                headerPath={`${getSiteUrl()}${url}?${buildQuery(section.id, '')}#_${sectionInfo.id}`}
                sectionInfo={sectionInfo}
                sectionPath={path}
                sections={section.sections}
                url={url}
                widgets={section.widgets}
            />
        </HyperlinkPathContext.Provider>
    );
};

export default SectionDetails;
