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
import {getOrganizationById} from 'src/config/config';

import {useOrganization} from 'src/hooks';

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
    const [issueData, setIssueData] = useState<SectionInfo | undefined>(sectionInfo);
    const elements = (issueData && issueData.elements) ? issueData.elements.map((element: any) => ({
        ...element,
        header: `${getOrganizationById(element.organizationId).name} - ${element.name}`,
    })) : [];

    useEffect(() => {
        setIssueData(sectionInfo);
    }, [sectionInfo]);

    return (
        <Container>
            <MainWrapper>
                <Header>
                    <NameHeader
                        id={issueData?.id || ''}
                        path={headerPath}
                        name={issueData?.name || ''}
                        enableEdit={true}
                        issueData={issueData}
                        setIssueData={setIssueData}
                        ecosystem={ecosystem}
                    />
                </Header>
                <Main>
                    <Body>
                        <EcosystemObjectivesWrapper
                            name={formatStringToCapitalize(ecosystemObjectivesWidget)}
                            objectives={issueData?.objectivesAndResearchArea}
                        />
                        <EcosystemOutcomesWrapper
                            name={formatStringToCapitalize(ecosystemOutcomesWidget)}
                            outcomes={issueData?.outcomes}
                        />
                        <EcosystemRolesWrapper
                            name={formatStringToCapitalize(ecosystemRolesWidget)}
                            roles={issueData?.roles}
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
                            attachments={issueData?.attachments}
                        />
                    </Body>
                </Main>
            </MainWrapper>
        </Container>
    );
};

export default React.memo(EcosystemRhs);
