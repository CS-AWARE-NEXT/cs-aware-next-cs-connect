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
    const showChildren = isUrlEqualWithoutQueryParams(`${getSiteUrl()}${url}`);
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