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
import {getOrganizationById} from 'src/config/config';
import {useToaster} from 'src/components/backstage/toast_banner';
import {useOrganization} from 'src/hooks';

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
    const [currentSectionInfo, setCurrentSectionInfo] = useState<SectionInfo | undefined>(sectionInfo);
    const elements = (currentSectionInfo && currentSectionInfo.elements) ? currentSectionInfo.elements.
        filter((element: any) => element.id !== '' && element.name !== '').
        map((element: any) => ({
            ...element,
            header: `${getOrganizationById(element.organizationId).name} - ${element.name}`,
        })) : [];

    useEffect(() => {
        setCurrentSectionInfo(sectionInfo);
    }, [sectionInfo]);

    const onExport = async () => {
        if (currentSectionInfo && section) {
            console.log('Exporting issue', currentSectionInfo.id, section.url);
            addToast({content: 'Work in Progress!'});
        }
    };

    return (
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
                        <EcosystemOutcomesWrapper
                            name={formatStringToCapitalize(ecosystemOutcomesWidget)}
                            outcomes={currentSectionInfo?.outcomes}
                        />
                        <EcosystemRolesWrapper
                            name={formatStringToCapitalize(ecosystemRolesWidget)}
                            roles={currentSectionInfo?.roles}
                        />
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
        </Container>
    );
};

export default React.memo(EcosystemRhs);
