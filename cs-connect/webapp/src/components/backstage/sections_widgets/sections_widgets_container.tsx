import React, {ReactNode, createContext, useContext} from 'react';

import {
    Body,
    Container,
    Header,
    Main,
    MainWrapper,
} from 'src/components/backstage/shared';
import {Section, SectionInfo, Widget} from 'src/types/organization';
import {NameHeader} from 'src/components/backstage/header/header';
import Sections from 'src/components/backstage/sections/sections';
import Widgets from 'src/components/backstage/widgets/widgets';
import {isUrlEqualWithoutQueryParams, useOrganization} from 'src/hooks';
import {archiveIssueChannels, deleteIssue, getSiteUrl} from 'src/clients';
import {formatName, formatNameNoLowerCase} from 'src/helpers';
import {navigateToBackstageOrganization} from 'src/browser_routing';

import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';

export const IsRhsContext = createContext(false);

type Props = {
    headerPath: string;
    isRhs?: boolean;
    name?: string
    sectionInfo?: SectionInfo;
    setSectionInfo?: React.Dispatch<React.SetStateAction<SectionInfo | undefined>>
    sectionPath?: string;
    sections?: Section[];
    url: string;
    widgets: Widget[];
    children?: ReactNode;
    childrenBottom?: boolean;
    deleteProps?: DeleteProps;
    enableEdit?: boolean;
};

type DeleteProps = {
    url: string
}

const SectionsWidgetsContainer = ({
    headerPath,
    isRhs = false,
    name = '',
    sectionInfo,
    setSectionInfo,
    sectionPath,
    sections,
    url,
    widgets,
    children = [],
    childrenBottom = true,
    deleteProps,
    enableEdit = false,
}: Props) => {
    const organizationId = useContext(OrganizationIdContext);
    const ecosystem = useOrganization(organizationId);

    // This currently suppose that the children are shown for issues,
    // that are placed always as the first section in the ecosystem organization.
    // Maybe it's needed to add a flag to indicate which is the issues section in the configuration file,
    // the reason is that the section may not be called issues or it may not be the first one
    const showChildren = isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}`) ||
        isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}/${sections ? formatNameNoLowerCase(sections[0]?.name) : ''}`) ||
        isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}/${sections ? formatName(sections[0]?.name) : ''}`);
    return (
        <IsRhsContext.Provider value={isRhs}>
            <Container>
                <MainWrapper>
                    <Header>
                        <NameHeader
                            id={sectionInfo?.id || name}
                            path={headerPath}
                            name={sectionInfo?.name || name}
                            url={deleteProps?.url}
                            sectionInfo={sectionInfo}
                            setSectionInfo={setSectionInfo}
                            onDelete={async () => {
                                if (sectionInfo && deleteProps) {
                                    await deleteIssue(sectionInfo.id, deleteProps.url);
                                    await archiveIssueChannels({issueId: sectionInfo.id});
                                    navigateToBackstageOrganization(organizationId);
                                }
                            }}
                            enableEdit={enableEdit}
                            ecosystem={ecosystem}
                        />
                    </Header>
                    <Main>
                        <Body>
                            {(showChildren && !childrenBottom) && children}
                            {sections && sectionPath &&
                                <Sections
                                    path={sectionPath}
                                    sections={sections}
                                    url={url}
                                />
                            }
                            <Widgets
                                widgets={widgets}
                            />
                            {(showChildren && childrenBottom) && children}
                        </Body>
                    </Main>
                </MainWrapper>
            </Container>
        </IsRhsContext.Provider>
    );
};

export default React.memo(SectionsWidgetsContainer);
