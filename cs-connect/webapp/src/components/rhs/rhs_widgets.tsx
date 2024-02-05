import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import styled from 'styled-components';
import {useLocation} from 'react-router-dom';
import {Alert} from 'antd';
import {useIntl} from 'react-intl';

import {
    buildQuery,
    useIsSectionFromEcosystem,
    useOrganization,
    useScrollIntoView,
    useSection,
    useSectionInfo,
} from 'src/hooks';
import RhsSectionsWidgetsContainer from 'src/components/rhs/rhs_sections_widgets_container';
import {getSiteUrl} from 'src/clients';
import {RefreshContext} from 'src/components/backstage/sections/section_details';

import {FullUrlContext} from './rhs';
import EcosystemRhs from './ecosystem/ecosystem_rhs';
import {HyperlinkPathContext} from './rhs_shared';

export const IsEcosystemRhsContext = createContext(false);
export const IsRhsScrollingContext = createContext(false);

type Props = {
    parentId: string;
    sectionId: string;
    organizationId: string;
};

const RHSWidgets = (props: Props) => {
    const {hash: urlHash} = useLocation();
    const {formatMessage} = useIntl();

    useScrollIntoView(urlHash);

    const [parentId, setParentId] = useState('');
    const [sectionId, setSectionId] = useState('');
    useEffect(() => {
        setParentId(props.parentId || '');
        setSectionId(props.sectionId || '');
    }, [props.parentId, props.sectionId]);

    const [refresh, setRefresh] = useState<boolean>(false);
    const forceRefresh = (): void => {
        setRefresh((prev) => !prev);
    };

    const section = useSection(parentId);
    const isEcosystem = useIsSectionFromEcosystem(parentId);
    const sectionInfo = useSectionInfo(sectionId, section?.url, refresh);
    const fullUrl = useContext(FullUrlContext);
    const organization = useOrganization(props.organizationId);

    const hyperlinkPath = (organization && section && sectionInfo) ? `${organization.name}.${section.name}.${sectionInfo.name}` : '';

    const [isScrolling, setIsScrolling] = useState<boolean>(false);
    const handleScroll = async () => {
        // TODO: implement this properly
    };

    return (
        <HyperlinkPathContext.Provider value={hyperlinkPath}>
            <RefreshContext.Provider value={{refresh, forceRefresh}}>
                <Container onScroll={handleScroll}>
                    {(section && sectionInfo && isEcosystem && section.isIssues) &&
                        <IsEcosystemRhsContext.Provider value={isEcosystem}>
                            <IsRhsScrollingContext.Provider value={isScrolling}>
                                <EcosystemRhs
                                    headerPath={`${getSiteUrl()}${fullUrl}?${buildQuery(parentId, sectionId)}#_${sectionInfo.id}`}
                                    parentId={parentId}
                                    sectionId={sectionId}
                                    sectionInfo={sectionInfo}
                                    section={section}
                                />
                            </IsRhsScrollingContext.Provider>
                        </IsEcosystemRhsContext.Provider>}
                    {(section && sectionInfo && (!isEcosystem || !section.isIssues)) &&
                        <RhsSectionsWidgetsContainer
                            headerPath={`${getSiteUrl()}${fullUrl}?${buildQuery(parentId, sectionId)}#_${sectionInfo.id}`}
                            sectionInfo={sectionInfo}
                            section={section}
                            url={fullUrl}
                            widgets={section?.widgets}
                        />}
                    {(!section || !sectionInfo) &&
                        <Alert
                            message={formatMessage({defaultMessage: 'The channel is not related to any section.'})}
                            type='info'
                            style={{marginTop: '8px'}}
                        />}
                </Container>
            </RefreshContext.Provider>
        </HyperlinkPathContext.Provider>
    );
};

const Container = styled.div`
    padding: 10px;
    overflow-y: auto;
`;

export default RHSWidgets;
