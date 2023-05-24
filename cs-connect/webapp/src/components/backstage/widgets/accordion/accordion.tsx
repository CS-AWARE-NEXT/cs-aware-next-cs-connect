import React, {ElementType, useContext, useEffect} from 'react';
import {Collapse, Empty} from 'antd';
import styled from 'styled-components';
import {useLocation} from 'react-router-dom';

import {AccordionData} from 'src/types/accordion';
import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {formatName} from 'src/helpers';

const {Panel} = Collapse;

type AccordionChildProps = {
    element: AccordionData;
    [key: string]: any;
};

type Props = {
    name: string;
    elements: AccordionData[];
    parentId: string;
    sectionId: string;
    childComponent: ElementType<AccordionChildProps>;
    [key: string]: any;
};

const Accordion = ({
    name,
    elements,
    parentId,
    sectionId,
    childComponent: ChildComponent,
    ...props
}: Props) => {
    const {hash: urlHash} = useLocation();
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    useEffect(() => {
        if (urlHash) {
            const panels = document.getElementsByClassName('ant-collapse-item') as HTMLCollectionOf<HTMLElement>;
            if (!panels) {
                return;
            }
            for (let i = 0; i < panels.length; i++) {
                const panel = panels[i];
                const referencedElements = panel?.querySelectorAll(`#${urlHash.substring(1)}`);
                if (referencedElements && referencedElements.length > 0) {
                    const header = panel.querySelector('.ant-collapse-header') as HTMLElement;
                    if (header && !panel.classList.contains('ant-collapse-item-active')) {
                        header.click();
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
    }, [urlHash]);

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={isEcosystemRhs ? '' : buildQuery(parentId, sectionId)}
                    text={name}
                    title={name}
                />
            </Header>
            {elements && elements.length > 0 ?

                // If you want one of the element to be opened by default, you can do as follows
                // defaultActiveKey={`${elements[0].id}-panel-key`}
                <Collapse accordion={true}>
                    {elements.map((element) => (
                        <>
                            <Panel
                                key={`${element.id}-panel-key`}
                                header={element.header}
                                id={`${element.id}-panel-key`}
                                forceRender={true}
                            >
                                <ChildComponent
                                    element={element}
                                    {...props}
                                />
                            </Panel>
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
