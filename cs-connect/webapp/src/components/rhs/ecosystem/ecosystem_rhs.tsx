import React, {useEffect, useState} from 'react';

import {
    Body,
    Container,
    Header,
    Main,
    MainWrapper,
} from 'src/components/backstage/shared';
import {NameHeader} from 'src/components/backstage/header/header';
import Accordion from 'src/components/backstage/widgets/accordion/accordion';
import {SectionInfo} from 'src/types/organization';
import {formatStringToCapitalize} from 'src/helpers';
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
import {getOrganizationById, getSystemConfig} from 'src/config/config';

import {buildEcosystemGraphUrl, useOrganization, useSection} from 'src/hooks';

import EcosystemGraphWrapper from 'src/components/backstage/widgets/graph/wrappers/ecosystem_graph_wrapper';

import {EcosystemGraphEditor} from 'src/components/commons/ecosystem_graph_edit';

import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';

import EcosystemAccordionChild from './ecosystem_accordion_child';

type Props = {
    headerPath: string;
    parentId: string;
    sectionId: string;
    sectionInfo: SectionInfo;
};

const EcosystemRhs = ({
    headerPath,
    parentId,
    sectionId,
    sectionInfo,
}: Props) => {
    const ecosystem = useOrganization(parentId);
    const issues = useSection(parentId);
    const isEcosystemGraphEnabled = getSystemConfig().ecosystemGraph;
    const ecosystemGraphUrl = buildEcosystemGraphUrl(issues.url, true);
    const [currentSectionInfo, setCurrentSectionInfo] = useState<SectionInfo | undefined>(sectionInfo);
    const elements = (currentSectionInfo && currentSectionInfo.elements) ? currentSectionInfo.elements.map((element: any) => ({
        ...element,
        header: `${getOrganizationById(element.organizationId).name} - ${element.name}`,
    })) : [];

    useEffect(() => {
        setCurrentSectionInfo(sectionInfo);
    }, [sectionInfo]);

    // IsRhs needed to use the correct style for the graphs
    return (
        <IsRhsContext.Provider value={true}>
            <Container>
                <MainWrapper>
                    <Header>
                        <NameHeader
                            id={currentSectionInfo?.id || ''}
                            path={headerPath}
                            name={currentSectionInfo?.name || ''}
                            enableEdit={true}
                            sectionInfo={currentSectionInfo}
                            setSectionInfo={setCurrentSectionInfo}
                            ecosystem={ecosystem}
                        />
                    </Header>
                    <Main>
                        <Body>
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
                            {isEcosystemGraphEnabled && (
                                <EcosystemGraphWrapper
                                    name='Ecosystem graph'
                                    url={ecosystemGraphUrl}
                                />)}
                            <Accordion
                                name={formatStringToCapitalize(ecosystemElementsWidget)}
                                childComponent={EcosystemAccordionChild}
                                elements={elements}
                                parentId={parentId}
                                sectionId={sectionId}
                            />
                            <EcosystemAttachmentsWrapper
                                name={formatStringToCapitalize(ecosystemAttachmentsWidget)}
                                attachments={currentSectionInfo?.attachments}
                            />
                        </Body>
                    </Main>
                </MainWrapper>
                {isEcosystemGraphEnabled &&
                <EcosystemGraphEditor
                    parentId={parentId}
                    sectionId={sectionId}
                />
                }
            </Container>
        </IsRhsContext.Provider>
    );
};

export default React.memo(EcosystemRhs);
