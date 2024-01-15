import React, {ElementType, useContext, useEffect} from 'react';
import {Collapse, Empty} from 'antd';
import styled from 'styled-components';

import {AccordionData} from 'src/types/accordion';
import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery, useUrlHash} from 'src/hooks';
import {formatName} from 'src/helpers';
import {DOT_PREFIX} from 'src/components/backstage/widgets/chart/charts/line/dots';
import {HyperlinkPathContext} from 'src/components/rhs/rhs_shared';

const {Panel} = Collapse;

type AccordionChildProps = {
    element: AccordionData;
    parentId?: string;
    sectionId?: string;
    [key: string]: any;
};

type Props = {
    name: string;
    elements: AccordionData[];
    parentId: string;
    sectionId: string;
    withHeader?: boolean;
    defaultActiveKey?: string[] | string | number[] | number;
    childComponent: ElementType<AccordionChildProps>;
    [key: string]: any;
};

const Accordion = ({
    name,
    elements,
    parentId,
    sectionId,
    withHeader = true,
    defaultActiveKey = '',
    childComponent: ChildComponent,
    ...props
}: Props) => {
    const urlHash = useUrlHash();
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const hyperlinkPathContext = useContext(HyperlinkPathContext);
    const hyperlinkPath = `${hyperlinkPathContext}.${name}`;

    // We could need to override default scroll
    // because we need to give the browser the time for content to be rendered.
    // However this can lead to problem with components usign the default scroll,
    // so we increased the time for the default scroll
    // useScrollIntoViewWithCustomTime(urlHash, 500);

    // TODO: With the urlHash as a dependency for the useEffect, the accordion won't open after being closed
    // when clicking on the same item. By removing it, it works. However, even sending a message
    // will open the panel related to the last clicked element.
    useEffect(() => {
        if (urlHash) {
            const panels = document.getElementsByClassName('ant-collapse-item') as HTMLCollectionOf<HTMLElement>;
            if (!panels) {
                return;
            }
            for (let i = 0; i < panels.length; i++) {
                let opened = false;
                const panel = panels[i];
                const selector = `#${urlHash.substring(1)}`;
                const referencedElements = panel?.querySelectorAll(selector);
                if (referencedElements && referencedElements.length > 0) {
                    const header = panel.querySelector('.ant-collapse-header') as HTMLElement;
                    if (header && !panel.classList.contains('ant-collapse-item-active')) {
                        header.click();
                        opened = true;
                    }
                }

                // TODO: probably a widget identifier is needed to generate unique widget container id when it is impossible to use id inside the element.
                // TODO: maybe it is not needed because it is ok to open whenever of them in the object, the section id is of the object,
                // thus it will be identical only if the widgets are in the same object which will always be in the same panel.
                // Then it is a responsibility of the scrollIntoView to scroll to the right element, here we just need to open the panel where the widget is.
                if (selector.includes(DOT_PREFIX) && !opened) {
                    // TODO: maybe here there will the need for a widgetId part to be at selectorParts[selectorParts.length - 2]
                    const selectorParts = selector.split('-');
                    const selectorSectionId = selectorParts[selectorParts.length - 1];
                    const chartElements = panel?.querySelectorAll(`#chart-container-${selectorSectionId}`);
                    if (chartElements && chartElements.length > 0) {
                        const header = panel.querySelector('.ant-collapse-header') as HTMLElement;
                        if (header && !panel.classList.contains('ant-collapse-item-active')) {
                            header.click();
                        }
                    }
                }

                // const content = panel.querySelector('.ant-collapse-content') as HTMLElement;
                // const header = panel.querySelector('.ant-collapse-header') as HTMLElement;
                // if (referencedElements) {
                //     content.classList.remove('ant-collapse-content-inactive');
                //     content.classList.remove('ant-collapse-content-hidden');
                //     content.classList.add('ant-collapse-content-active');
                //     panel.classList.add('ant-collapse-item-active');
                //     header.ariaExpanded = 'true'
                // } else {
                //     panel.classList.remove('ant-collapse-item-active');
                //     content.classList.remove('ant-collapse-content-active');
                //     content.classList.add('ant-collapse-content-inactive');
                //     content.classList.add('ant-collapse-content-hidden');
                //     header.ariaExpanded = 'true'
                // }
            }
        }
    }, [urlHash, elements]);

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;

    return (
        <Container
            id={id}
            data-testid={id}
        >
            {withHeader &&
                <Header>
                    <AnchorLinkTitle
                        fullUrl={fullUrl}
                        id={id}
                        query={isEcosystemRhs ? '' : buildQuery(parentId, sectionId)}
                        text={name}
                        title={name}
                    />
                </Header>}
            {elements && elements.length > 0 ?

            // If you want one of the element to be opened by default, you can do as follows
            // defaultActiveKey={`${elements[0].id}-panel-key`}

                <Collapse
                    accordion={true}
                    defaultActiveKey={defaultActiveKey ?? ''}
                >
                    {elements.map((element) => (
                        <>
                            <HyperlinkPathContext.Provider value={`${hyperlinkPath}.${element.header}`}>
                                <Panel
                                    key={`${element.id}-panel-key`}
                                    header={element.header}
                                    id={`${element.id}-panel-key`}
                                    forceRender={true}
                                >
                                    <ChildComponent
                                        element={element}
                                        sectionId={sectionId}
                                        parentId={parentId}
                                        {...props}
                                    />
                                </Panel>
                            </HyperlinkPathContext.Provider>
                        </>
                    ))}
                </Collapse> :
                <Empty/>}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default Accordion;
