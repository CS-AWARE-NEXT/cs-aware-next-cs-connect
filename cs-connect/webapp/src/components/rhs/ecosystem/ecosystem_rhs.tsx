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
import {Section, SectionInfo} from 'src/types/organization';
import {formatStringToCapitalize} from 'src/helpers';
import EcosystemAttachmentsWrapper from 'src/components/backstage/widgets/list/wrappers/ecosystem_attachments_wrapper';
import EcosystemObjectivesWrapper from 'src/components/backstage/widgets/text_box/wrappers/ecosystem_objectives_wrapper';

// import EcosystemOutcomesWrapper from 'src/components/backstage/widgets/list/wrappers/ecosystem_outcomes_wrapper';
// import EcosystemRolesWrapper from 'src/components/backstage/widgets/paginated_table/wrappers/ecosystem_roles_wrapper';
import {ecosystemAttachmentsWidget, ecosystemElementsWidget, ecosystemObjectivesWidget} from 'src/constants';
import {getOrganizationById, getSystemConfig} from 'src/config/config';
import {useToaster} from 'src/components/backstage/toast_banner';
import {
    buildEcosystemGraphUrl,
    getSection,
    useOrganization,
    useSection,
} from 'src/hooks';

import EcosystemGraphWrapper from 'src/components/backstage/widgets/graph/wrappers/ecosystem_graph_wrapper';

import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';

import EcosystemGraphEditor from 'src/components/commons/ecosystem_graph_edit';

import EcosystemAccordionChild from './ecosystem_accordion_child';

type Props = {
    headerPath: string;
    parentId: string;
    sectionId: string;
    sectionInfo: SectionInfo;
    section: Section;
};

const EcosystemRhs = ({
    headerPath,
    parentId,
    sectionId,
    sectionInfo,
    section,
}: Props) => {
    const {add: addToast} = useToaster();
    const ecosystem = useOrganization(parentId);
    const issues = useSection(parentId);
    const isEcosystemGraphEnabled = getSystemConfig().ecosystemGraph;
    const ecosystemGraphUrl = buildEcosystemGraphUrl(issues.url, true);
    const [currentSectionInfo, setCurrentSectionInfo] = useState<SectionInfo | undefined>(sectionInfo);

    // the second filter is to filter out elements with deleted parent sections,
    // which can happen when a section is deleted or a whole organization is deleted
    const elements = (currentSectionInfo && currentSectionInfo.elements) ? currentSectionInfo.elements.
        filter((element: any) => element.id !== '' && element.name !== '').
        filter((element: any) => element.parentId !== '' && getSection(element.parentId)).
        map((element: any) => ({
            ...element,
            header: `${getOrganizationById(element.organizationId).name} - ${element.name}`,
        })) : [];

    useEffect(() => {
        setCurrentSectionInfo(sectionInfo);
    }, [sectionInfo]);

    const onExport = async () => {
        if (currentSectionInfo && section) {
            addToast({content: 'Work in Progress!'});
        }
    };

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
                            enableEcosystemEdit={true}
                            sectionInfo={currentSectionInfo}
                            setSectionInfo={setCurrentSectionInfo}
                            ecosystem={ecosystem}
                            onExport={onExport}
                            url={section.url}
                        />
                    </Header>
                    <Main>
                        <Body>
                            <EcosystemObjectivesWrapper
                                name={formatStringToCapitalize(ecosystemObjectivesWidget)}
                                objectives={currentSectionInfo?.objectivesAndResearchArea}
                            />
                            {/* <EcosystemOutcomesWrapper
                                name={formatStringToCapitalize(ecosystemOutcomesWidget)}
                                outcomes={currentSectionInfo?.outcomes}
                            /> */}
                            {/* <EcosystemRolesWrapper
                                name={formatStringToCapitalize(ecosystemRolesWidget)}
                                roles={currentSectionInfo?.roles}
                            /> */}
                            {isEcosystemGraphEnabled && (
                                <EcosystemGraphWrapper
                                    name='Ecosystem Graph'
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
