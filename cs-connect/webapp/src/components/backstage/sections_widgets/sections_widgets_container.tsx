import React, {ReactNode, createContext, useContext} from 'react';
import {Alert} from 'antd';
import {useIntl} from 'react-intl';

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
import {getSiteUrl} from 'src/clients';
import {formatName, formatNameNoLowerCase} from 'src/helpers';

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
    actionProps?: ActionProps;
    enableEcosystemEdit?: boolean;

    onDelete?: () => void;
    onExport?: () => void;
};

type ActionProps = {
    url: string;
};

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
    actionProps,
    enableEcosystemEdit = false,
    onDelete,
    onExport,
}: Props) => {
    const {formatMessage} = useIntl();

    const organizationId = useContext(OrganizationIdContext);
    const ecosystem = useOrganization(organizationId);

    // This currently suppose that the children are shown for issues,
    // that are placed always as the section at index 0 in the ecosystem organization.
    // Maybe it's needed to add a flag to indicate which is the issues section in the configuration file,
    // the reason is that the section may not be called issues or it may not be the first one
    // TODO: Retrieve the Issue section by using the isIssues flag on sections
    const showChildren = isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}`) ||
        isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}/${sections ? formatNameNoLowerCase(sections[0]?.name) : ''}`) ||
        isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}/${sections ? formatName(sections[0]?.name) : ''}`);

    if (sectionInfo && sectionInfo.id === '' && sectionInfo.name === '') {
        return (
            <Container>
                <MainWrapper>
                    <Header>
                        <NameHeader
                            id={sectionInfo?.id || name}
                            path={headerPath}
                            name='[Deleted]'
                            sectionInfo={sectionInfo}
                            ecosystem={ecosystem}
                        />
                    </Header>
                    <Main>
                        <Body>
                            <Alert
                                message={formatMessage({defaultMessage: 'This section has been deleted!'})}
                                type='info'
                                style={{marginTop: '24px'}}
                            />
                        </Body>
                    </Main>
                </MainWrapper>
            </Container>
        );
    }

    return (
        <IsRhsContext.Provider value={isRhs}>
            <Container>
                <MainWrapper>
                    <Header>
                        <NameHeader
                            id={sectionInfo?.id || name}
                            path={headerPath}
                            name={sectionInfo?.name || name}
                            url={actionProps?.url}
                            sectionInfo={sectionInfo}
                            setSectionInfo={setSectionInfo}
                            onDelete={onDelete}
                            onExport={onExport}
                            enableEcosystemEdit={enableEcosystemEdit}
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
