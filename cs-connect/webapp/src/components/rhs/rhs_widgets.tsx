import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import {FormattedMessage} from 'react-intl';
import styled from 'styled-components';
import {useLocation} from 'react-router-dom';

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
    useScrollIntoView(urlHash);

    const [parentId, setParentId] = useState('');
    const [sectionId, setSectionId] = useState('');
    useEffect(() => {
        setParentId(props.parentId || '');
        setSectionId(props.sectionId || '');
    }, [props.parentId, props.sectionId]);

    const section = useSection(parentId);
    const isEcosystem = useIsSectionFromEcosystem(parentId);
    const sectionInfo = useSectionInfo(sectionId, section?.url);
    const fullUrl = useContext(FullUrlContext);
    const organization = useOrganization(props.organizationId);

    const hyperlinkPath = (organization && section && sectionInfo) ? `${organization.name}.${section.name}.${sectionInfo.name}` : '';

    const [isScrolling, setIsScrolling] = useState<boolean>(false);
    const handleScroll = async () => {
        // TODO: implement this properly
    };

    return (
        <Container onScroll={handleScroll}>
            <HyperlinkPathContext.Provider value={hyperlinkPath}>
                {(section && sectionInfo && isEcosystem) &&
                    <IsEcosystemRhsContext.Provider value={isEcosystem}>
                        <IsRhsScrollingContext.Provider value={isScrolling}>
                            <EcosystemRhs
                                headerPath={`${getSiteUrl()}${fullUrl}?${buildQuery(parentId, sectionId)}#_${sectionInfo.id}`}
                                parentId={parentId}
                                sectionId={sectionId}
                                sectionInfo={sectionInfo}
                            />
                        </IsRhsScrollingContext.Provider>
                    </IsEcosystemRhsContext.Provider>}
                {(section && sectionInfo && !isEcosystem) &&
                    <RhsSectionsWidgetsContainer
                        headerPath={`${getSiteUrl()}${fullUrl}?${buildQuery(parentId, sectionId)}#_${sectionInfo.id}`}
                        sectionInfo={sectionInfo}
                        url={fullUrl}
                        widgets={section?.widgets}
                    />}
                {(!section || !sectionInfo) && <FormattedMessage defaultMessage='The channel is not related to any section.'/>}
            </HyperlinkPathContext.Provider>
        </Container>
    );
};

const Container = styled.div`
    padding: 10px;
    overflow-y: auto;
`;

export default RHSWidgets;
