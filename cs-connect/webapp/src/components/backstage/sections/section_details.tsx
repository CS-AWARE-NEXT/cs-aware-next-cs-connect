import React, {createContext, useContext, useState} from 'react';
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
import {useToaster} from 'src/components/backstage/toast_banner';
import {updatePolicyTemplateFieldAction} from 'src/actions';

import {SECTION_NAV_ITEM, SECTION_NAV_ITEM_ACTIVE} from './sections';

type Refresh = {
    refresh: boolean;
    forceRefresh: (() => void) | null;
};

export const RefreshContext = createContext<Refresh>({
    refresh: false,
    forceRefresh: null,
});

const SectionDetails = () => {
    const {url, path, params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const {hash: urlHash, search} = useLocation();
    const queryParams = qs.parse(search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const [refresh, setRefresh] = useState<boolean>(false);
    const forceRefresh = (): void => {
        setRefresh((prev) => !prev);
    };

    const section = useSection(parentIdParam);
    const sectionInfo = useSectionInfo(sectionId, section.url, refresh);
    const isEcosystem = useContext(IsEcosystemContext);
    const organizationId = useContext(OrganizationIdContext);

    useForceDocumentTitle(sectionInfo.name ? (sectionInfo.name) : 'Section');
    useScrollIntoView(urlHash);
    useNavHighlighting(SECTION_NAV_ITEM, SECTION_NAV_ITEM_ACTIVE, section.name, [parentIdParam]);

    const {add: addToast} = useToaster();

    // Loading state
    if (!section) {
        return null;
    }

    let enableActions = false;
    if (section && section.internal) {
        enableActions = true;
    }

    const onDelete = async () => {
        if (sectionInfo && section) {
            await deleteSectionInfo(sectionInfo.id, section.url);
            await archiveChannels({sectionId: sectionInfo.id});
            navigateToBackstageOrganization(`${organizationId}/${formatName(section.name)}`);
        }
    };

    const onExport = async () => {
        if (sectionInfo && section) {
            console.log('Exporting section', sectionInfo.id, section.url);
            updatePolicyTemplateFieldAction({
                policyId: sectionInfo.id,
                field: 'exported',
                value: 'true',
            }, true);
            forceRefresh();
            addToast({content: 'Work in Progress!'});
        }
    };

    return (
        isEcosystem ?
            <RefreshContext.Provider value={{refresh, forceRefresh}}>
                <EcosystemSectionsWidgetsContainer
                    section={section}
                    sectionInfo={sectionInfo}
                />
            </RefreshContext.Provider> :
            <RefreshContext.Provider value={{refresh, forceRefresh}}>
                <SectionsWidgetsContainer
                    headerPath={`${getSiteUrl()}${url}?${buildQuery(section.id, '')}#_${sectionInfo.id}`}
                    sectionInfo={sectionInfo}
                    sectionPath={path}
                    sections={section.sections}
                    url={url}
                    widgets={section.widgets}
                    actionProps={enableActions ? {url: section.url} : undefined}
                    onDelete={enableActions ? onDelete : undefined}
                    onExport={enableActions ? onExport : undefined}
                />
            </RefreshContext.Provider>
    );
};

export default SectionDetails;
