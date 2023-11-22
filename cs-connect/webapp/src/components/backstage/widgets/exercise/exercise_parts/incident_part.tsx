import React, {useContext} from 'react';
import styled from 'styled-components';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {formatName, formatStringToLowerCase} from 'src/helpers';
import {AccordionData} from 'src/types/accordion';
import GraphWrapper from 'src/components/backstage/widgets/graph/wrappers/graph_wrapper';
import {WidgetType} from 'src/components/backstage/widgets/widget_types';
import {getOrganizationById} from 'src/config/config';

type Props = {
    data: AccordionData;
    name: string;
    parentId: string;
    sectionId: string;
};

const IncidentPart = ({
    data,
    name = '',
    parentId,
    sectionId,
}: Props) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    let graphName = '';
    let graphUrl = '';
    if (data?.organizationId) {
        const organization = getOrganizationById(data.organizationId);
        const incidentsSection = organization.sections.find((section) => formatStringToLowerCase(section.name).includes('incidents'));
        const widgets = incidentsSection ? incidentsSection.widgets : [];
        const graphWidget = widgets.find((widget) => widget.type === WidgetType.Graph);
        graphName = graphWidget?.name ?? '';
        graphUrl = graphWidget?.url ?? '';
    }
    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={ecosystemQuery}
                    text={name}
                    title={name}
                />
            </Header>
            {(graphName !== '' && graphUrl !== '') &&
                <GraphWrapper
                    name={graphName}
                    url={graphUrl}
                />}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default IncidentPart;