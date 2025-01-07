import React, {FC, useContext} from 'react';
import styled from 'styled-components';

import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {EMPTY_EDGE_DESCRIPTION, GraphEdgeInfo as EdgeInfo} from 'src/types/graph';
import {VerticalSpacer} from 'src/components/backstage/grid';
import {IsRhsClosedContext} from 'src/components/rhs/rhs';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';

export const EDGE_INFO_ID_PREFIX = 'edge-info-';

type Props = {
    info: EdgeInfo;
    sectionId: string;
    parentId: string;
    graphName: string;
};

const textBoxStyle = {
    height: '5vh',
    marginTop: '0px',
};

// To add more sections, be sure to also update the suggestions parsers to properly add hyperlinking functionality.
const GraphEdgeInfo: FC<Props> = ({
    info,
    sectionId,
    parentId,
    graphName,
}) => {
    const isRhs = useContext(IsRhsContext);
    const isRhsClosed = useContext(IsRhsClosedContext);

    const {description} = info;
    return (
        <Container>
            <TextBox
                name={'Description'}
                sectionId={sectionId}
                parentId={parentId}
                text={description ?? EMPTY_EDGE_DESCRIPTION}
                style={textBoxStyle}
                customId={`_${info.edgeId}-${sectionId}-${parentId}-${EDGE_INFO_ID_PREFIX}-widget`}
                titleText={`${graphName}.Edge.Description`}
            />
            {(isRhs && isRhsClosed) && <VerticalSpacer size={24}/>}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
    margin-bottom: 24px;
`;

export default GraphEdgeInfo;
