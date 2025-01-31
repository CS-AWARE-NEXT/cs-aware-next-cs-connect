import React, {FC} from 'react';
import {Select} from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons';

import {
    EDGE_TYPE_COOPERATING_WITH,
    EDGE_TYPE_MANAGED_BY,
    EDGE_TYPE_SUPPLIED_BY,
    EdgeSelectionData,
    StyledButton,
} from './editable_graph';
import MarkdownTextArea from './markdown_textarea';
import LabelWithInfoText, {Label} from './label_with_info_text';

type Props = {
    editEnabled: boolean,
    edgeSelectionData: EdgeSelectionData,
    updateEdgeData: (newData: any) => void,
};

const getEdgeDescriptionInfoText = (kind: string): string => {
    if (kind === EDGE_TYPE_MANAGED_BY) {
        return 'A short description describing the type of the managing relation. E.g. an organisation could be the owner of the service, or be contracted to manage the service on behalf of the owner.';
    }
    if (kind === EDGE_TYPE_COOPERATING_WITH) {
        return 'Description of the collaboration that happens between the organsiations.';
    }
    if (kind === EDGE_TYPE_SUPPLIED_BY) {
        return 'A short description of the supply relationship, and how the supplied service is used by the consuming service/organisation.';
    }
    return '';
};

const EdgeSidebar: FC<Props> = ({
    editEnabled,
    edgeSelectionData,
    updateEdgeData,
}) => {
    return (
        <>
            <Label>
                <InfoCircleOutlined/> {'Edge'}
            </Label>

            <LabelWithInfoText
                label='Description'
                infoText={getEdgeDescriptionInfoText(edgeSelectionData.kind)}
            />
            <MarkdownTextArea
                field='description'
                label='edge-description'
                placeholder='Enter edge description'
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
            />

            <LabelWithInfoText
                label='Type'
                infoText={'The type of relationship between assets.'}
            />
            <Select
                defaultValue={EDGE_TYPE_MANAGED_BY}
                value={edgeSelectionData.kind}
                style={{width: '100%'}}
                disabled={!editEnabled}

                // IMPORTANT: here more options for type
                options={[
                    {value: EDGE_TYPE_MANAGED_BY, label: 'Managed by'},
                    {value: EDGE_TYPE_SUPPLIED_BY, label: 'Supplied by'},
                    {value: EDGE_TYPE_COOPERATING_WITH, label: 'Cooperating with'},
                ]}
                onChange={(value) => {
                    updateEdgeData({kind: value});
                }}
            />

            {/* <Divider/> */}

            <StyledButton
                type='primary'
                danger={true}
                block={true}
                disabled={!editEnabled}

                // style={{
                //     position: 'sticky',
                //     bottom: 0,
                // }}
                onClick={() => {
                    updateEdgeData({delete: true});
                }}
            >
                {'Delete edge'}
            </StyledButton>
        </>
    );
};

export default EdgeSidebar;