import React, {ReactNode, createContext} from 'react';

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
import {isUrlEqualWithoutQueryParams} from 'src/hooks';
import {getSiteUrl} from 'src/clients';
import {formatStringToLowerCase} from 'src/helpers';

export const IsRhsContext = createContext(false);

type Props = {
    headerPath: string;
    isRhs?: boolean;
    name?: string
    sectionInfo?: SectionInfo;
    sectionPath?: string;
    sections?: Section[];
    url: string;
    widgets: Widget[];
    children?: ReactNode;
    childrenBottom?: boolean;
};

const SectionsWidgetsContainer = ({
    headerPath,
    isRhs = false,
    name = 'default',
    sectionInfo,
    sectionPath,
    sections,
    url,
    widgets,
    children = [],
    childrenBottom = true,
}: Props) => {
    // This currently suppose that the children are shown for issues,
    // that are placed always as the first section in the ecosystem organization.
    // Maybe it's needed to add a flag to indicate which is the issues section in the configuration file,
    // the reason is that the section may not be called issues or it may not be the first one
    const showChildren = isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}`) ||
        isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}/${sections ? sections[0]?.name : ''}`) ||
        isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}/${sections ? formatStringToLowerCase(sections[0]?.name) : ''}`);
    return (
        <IsRhsContext.Provider value={isRhs}>
            <Container>
                <MainWrapper>
                    <Header>
                        <NameHeader
                            id={sectionInfo?.id || name}
                            path={headerPath}
                            name={sectionInfo?.name || name}
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

export default SectionsWidgetsContainer;