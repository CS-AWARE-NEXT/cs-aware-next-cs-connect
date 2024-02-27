import React, {FC} from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getSmoothStepPath,
} from 'reactflow';

import styled from 'styled-components';

import {EDGE_TYPE_SUPPLIED_BY} from './editable_graph';

// This is needed to add a label to handle an edge onclick event. React Flow doesn't allow a proper onClick handler on the svg itself.
const CustomEdge: FC<EdgeProps & {
    onEdgeClick: (id: string, kind: string) => void;
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

    const customStyle = {
        ...style,
        stroke: (data?.isUrlHashed ? '#f4b400' : undefined),
        strokeWidth: (data?.isUrlHashed ? 1.5 : undefined),
        strokeDasharray: (data?.kind === EDGE_TYPE_SUPPLIED_BY ? 5 : 0),
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
                        onEdgeClick(id, data.kind);
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
