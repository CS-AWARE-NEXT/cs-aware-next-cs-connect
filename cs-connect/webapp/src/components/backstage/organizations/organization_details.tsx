import React, {createContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';

import {DEFAULT_PATH, ORGANIZATIONS_PATH} from 'src/constants';
import {useForceDocumentTitle, useOrganization, useScrollIntoView} from 'src/hooks';
import SectionsWidgetsContainer from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {getSiteUrl} from 'src/clients';

import EcosystemDetails from './ecosystem/ecosystem_details';

export const OrganizationIdContext = createContext('');

const OrganizationDetails = () => {
    const {url, path, params: {organizationId}} = useRouteMatch<{organizationId: string}>();
    const {hash: urlHash} = useLocation();
    const organization = useOrganization(organizationId);

    useForceDocumentTitle(organization.name ? (organization.name) : 'Organizations');

    useScrollIntoView(urlHash);

    // Loading state
    if (!organization) {
        return null;
    }

    return (
        (organization.isEcosystem) ?
            <OrganizationIdContext.Provider value={organization.id}>
                <EcosystemDetails/>
            </OrganizationIdContext.Provider> :
            <OrganizationIdContext.Provider value={organization.id}>
                <SectionsWidgetsContainer
                    headerPath={`${getSiteUrl()}/${DEFAULT_PATH}/${ORGANIZATIONS_PATH}/${organization.id}`}
                    name={organization.name}
                    sectionPath={path}
                    sections={organization.sections}
                    url={url}
                    widgets={organization.widgets}
                />
            </OrganizationIdContext.Provider>
    );
};

export default OrganizationDetails;