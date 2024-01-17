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
import SectionsWidgetsContainer from 'src/components/backstage/sections_widgets/sections_widgets_container';
import EcosystemSectionsWidgetsContainer from 'src/components/backstage//sections_widgets/ecosystem_sections_widgets_container';
import {archiveChannels, deleteSectionInfo, getSiteUrl} from 'src/clients';
import {IsEcosystemContext} from 'src/components/backstage/organizations/ecosystem/ecosystem_details';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import {navigateToBackstageOrganization} from 'src/browser_routing';
import {formatName} from 'src/helpers';

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

    useForceDocumentTitle(sectionInfo.name ? (sectionInfo.name) : 'Section');
    useScrollIntoView(urlHash);
    useNavHighlighting(SECTION_NAV_ITEM, SECTION_NAV_ITEM_ACTIVE, section.name, [parentIdParam]);

    // Loading state
    if (!section) {
        return null;
    }

    let enableDelete = false;
    if (section && section.internal) {
        enableDelete = true;
    }

    const onDelete = async () => {
        if (sectionInfo && section) {
            await deleteSectionInfo(sectionInfo.id, section.url);
            await archiveChannels({sectionId: sectionInfo.id});
            navigateToBackstageOrganization(`${organizationId}/${formatName(section.name)}`);
        }
    };

    return (
        isEcosystem ?
            <EcosystemSectionsWidgetsContainer
                section={section}
                sectionInfo={sectionInfo}
            /> :
            <SectionsWidgetsContainer
                headerPath={`${getSiteUrl()}${url}?${buildQuery(section.id, '')}#_${sectionInfo.id}`}
                sectionInfo={sectionInfo}
                sectionPath={path}
                sections={section.sections}
                url={url}
                widgets={section.widgets}
                deleteProps={enableDelete ? {url: section.url} : undefined}
                onDelete={enableDelete ? onDelete : undefined}
            />
    );
};

export default SectionDetails;
