import React, {FC} from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getSmoothStepPath,
} from 'reactflow';
import styled from 'styled-components';

import {
    EDGE_TYPE_COOPERATING_WITH,
    EDGE_TYPE_OPERATED_BY,
    EDGE_TYPE_SUPPLIED_BY,
    EDGE_TYPE_SUPPORTED_BY,
} from './editable_graph';

const getStroke = (kind: string | undefined) => {
    if (kind === EDGE_TYPE_SUPPLIED_BY) {
        return 5;
    }
    if (kind === EDGE_TYPE_COOPERATING_WITH) {
        return 8;
    }
    if (kind === EDGE_TYPE_OPERATED_BY) {
        return 13;
    }
    if (kind === EDGE_TYPE_SUPPORTED_BY) {
        return 18;
    }
    return 0;
};

// This is needed to add a label to handle an edge onclick event. React Flow doesn't allow a proper onClick handler on the svg itself.
// IMPORTANT: add here extra edge data info
const CustomEdge: FC<EdgeProps & {
    onEdgeClick: (
        id: string,
        kind: string,
        description: string | undefined,
        criticalityLevel: number | undefined,
        serviceLevelAgreement: string | undefined,
        bcdrDescription: string | undefined,
        rto: string | undefined,
        rpo: string | undefined,
        confidentialityLevel: number | undefined,
        integrityLevel: number | undefined,
        availabilityLevel: number | undefined,
        ciaRationale: string | undefined,
        mtpd: string | undefined,
        realtimeStatus: string | undefined,
    ) => void;
}> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
    onEdgeClick,
}) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 0,
    });

    // TODO: custom style for the svg of the edge (https://css-tricks.com/svg-properties-and-css/)
    const customStyle = {
        ...style,
        stroke: (data?.isUrlHashed ? '#f4b400' : undefined),
        strokeWidth: (data?.isUrlHashed ? 1.5 : undefined),
        strokeDasharray: getStroke(data?.kind),
    };

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={customStyle}
            />
            <EdgeLabelRenderer>
                <div
                    onClick={() => {
                        // IMPORTANT: add here all extra edge info
                        onEdgeClick(
                            id,
                            data.kind,
                            data.description,
                            data.criticalityLevel,
                            data.serviceLevelAgreement,
                            data.bcdrDescription,
                            data.rto,
                            data.rpo,
                            data.confidentialityLevel,
                            data.integrityLevel,
                            data.availabilityLevel,
                            data.ciaRationale,
                            data.mtpd,
                            data.realtimeStatus,
                        );
                    }}
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: 'all',
                        cursor: 'pointer',
                    }}
                    className='nodrag nopan'
                >
                    <EdgeInfo className='fa fa-info'/>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

const EdgeInfo = styled.i`
    width: 20px;
    height: 20px;
    background: #eee;
    border: 1px solid #fff;
    cursor: pointer;
    border-radius: 50%;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
`;

export default CustomEdge;
