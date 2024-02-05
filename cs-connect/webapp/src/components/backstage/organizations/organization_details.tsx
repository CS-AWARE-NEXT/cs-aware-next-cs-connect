import React, {createContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';

import {DEFAULT_PATH, ORGANIZATIONS_PATH} from 'src/constants';
import {useForceDocumentTitle, useOrganization, useScrollIntoView} from 'src/hooks';
import SectionsWidgetsContainer from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {getSiteUrl} from 'src/clients';

import {HyperlinkPathContext} from 'src/components/rhs/rhs_shared';

import EcosystemDetails from './ecosystem/ecosystem_details';

export const OrganizationIdContext = createContext('');

const OrganizationDetails = () => {
    const {url, path, params: {organizationId}} = useRouteMatch<{organizationId: string}>();
    const {hash: urlHash} = useLocation();
    const organization = useOrganization(organizationId);
    const hyperlinkPath = organization ? `${organization.name}` : '';

    useForceDocumentTitle(organization?.name ? (organization.name) : 'Organizations');

    useScrollIntoView(urlHash);

    // Loading state
    if (!organization) {
        return null;
    }

    return (
        (organization.isEcosystem) ? <HyperlinkPathContext.Provider value={hyperlinkPath}><OrganizationIdContext.Provider value={organization.id}>
            <EcosystemDetails/>
        </OrganizationIdContext.Provider></HyperlinkPathContext.Provider> : <HyperlinkPathContext.Provider value={hyperlinkPath}><OrganizationIdContext.Provider value={organization.id}>
            <SectionsWidgetsContainer
                headerPath={`${getSiteUrl()}/${DEFAULT_PATH}/${ORGANIZATIONS_PATH}/${organization.id}`}
                name={organization.name}
                sectionPath={path}
                sections={organization.sections}
                url={url}
                widgets={organization.widgets}
            />
        </OrganizationIdContext.Provider></HyperlinkPathContext.Provider>
    );
};

export default OrganizationDetails;
