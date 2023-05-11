import React from 'react';
import {useIntl} from 'react-intl';

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
import {formatStringToCapitalize} from 'src/hooks';
import {ecosystemElementsWidget} from 'src/constants';

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
    const {formatMessage} = useIntl();
    return (
        <Container>
            <MainWrapper>
                <Header>
                    <NameHeader
                        id={sectionInfo.id}
                        path={headerPath}
                        name={sectionInfo.name}
                    />
                </Header>
                <Main>
                    <Body>
                        <Accordion
                            name={formatStringToCapitalize(ecosystemElementsWidget)}
                            childComponent={EcosystemAccordionChild}
                            elements={sectionInfo.elements}
                            parentId={parentId}
                            sectionId={sectionId}
                        />
                    </Body>
                </Main>
            </MainWrapper>
        </Container>
    );
};

export default EcosystemRhs;