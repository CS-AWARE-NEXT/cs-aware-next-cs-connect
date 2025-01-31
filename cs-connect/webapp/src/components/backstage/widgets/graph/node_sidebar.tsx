import React, {FC} from 'react';
import {Select} from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons';

import {NodeSelectionData, StyledButton} from './editable_graph';
import MarkdownTextArea from './markdown_textarea';
import LabelWithInfoText, {Label} from './label_with_info_text';

type Props = {
    editEnabled: boolean,
    nodeSelectionData: NodeSelectionData,
    updateNodeData: (newData: any) => void,
};

const NodeSidebar: FC<Props> = ({
    editEnabled,
    nodeSelectionData,
    updateNodeData,
}) => {
    return (
        <>
            <Label>
                <InfoCircleOutlined/> {nodeSelectionData?.label ? `${nodeSelectionData?.label}` : 'Node information'}
            </Label>

            <LabelWithInfoText
                label='Name'
                infoText={
                    nodeSelectionData.kind === 'rectangle' ? 'The organization\'s name' : 'The service\'s name'
                }
            />
            <MarkdownTextArea
                field='label'
                label='node-name'
                placeholder='Enter node name'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                rows={2}
            />

            <LabelWithInfoText
                label='Description'
                infoText={
                    nodeSelectionData.kind === 'rectangle' ?
                        'A short descripton of the company and its place in the ecosystem.' :
                        'A short description of the service and its place in the ecosystem.'
                }
            />
            <MarkdownTextArea
                field='description'
                label='node-description'
                placeholder='Enter node description'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
            />

            <LabelWithInfoText
                label='Type'
                infoText={'Whether the asset is an organization or a service.'}
            />
            <Select
                defaultValue='default'
                value={nodeSelectionData.kind}
                style={{width: '100%'}}
                disabled={!editEnabled}
                options={[
                    {value: 'default', label: 'Default'},

                    // {value: 'database', label: 'Database'},
                    // {value: 'cloud', label: 'Cloud'},
                    // {value: 'network', label: 'Network'},
                    {value: 'rectangle', label: 'Organization'},
                    {value: 'oval', label: 'Service'},
                ]}
                onChange={(value) => {
                    updateNodeData({kind: value});
                }}
            />

            {/* <Divider/> */}

            <StyledButton
                type='primary'
                danger={true}
                block={true}
                disabled={!editEnabled || nodeSelectionData.id === 'root'}

                // style={{
                //     position: 'sticky',
                //     bottom: 0,
                // }}
                onClick={() => {
                    updateNodeData({delete: true});
                }}
            >
                {'Delete node'}
            </StyledButton>
        </>
    );
};

export default NodeSidebar;