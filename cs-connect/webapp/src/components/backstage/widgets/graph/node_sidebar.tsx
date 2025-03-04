import React, {FC} from 'react';
import {Alert, Select} from 'antd';
import {InfoCircleOutlined} from '@ant-design/icons';

import {NodeSelectionData, StyledButton} from './editable_graph';
import MarkdownTextArea from './markdown_textarea';
import LabelWithInfoText, {Label} from './label_with_info_text';
import InputNumber from './input_number';

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
                label='Contacts'
                infoText={
                    nodeSelectionData.kind === 'rectangle' ?
                        'A list of contacts defining how the community can engage with the company for different purposes. Should at least contain the contact information for the cybersecurity and data protection responsibles in the company.' :
                        'A list of contacts defining how the community can engage with the company for different purposes. Should at least contain the contact information for the cybersecurity and data protection responsibles in the company. Can be the same as contacts for the organisation, but may also be service specific contacts.'
                }
                visible={nodeSelectionData.kind !== 'default'}
            />
            <MarkdownTextArea
                field='contacts'
                label='node-contacts'
                placeholder='Enter contacts'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind !== 'default'}
            />

            <LabelWithInfoText
                label='Collaboration Policies'
                infoText={
                    nodeSelectionData.kind === 'rectangle' ?
                        'An optional set of rules and guidelines that define how the community should engage with the company in the context of cybersecurity.' :
                        'An optional set of rules and guidelines that define how the community should engage with the company in the context of cybersecurity. Can be the same as on organisation level, but may also be different.'
                }
                visible={nodeSelectionData.kind !== 'default'}
            />
            <MarkdownTextArea
                field='collaborationPolicies'
                label='node-collaborationPolicies'
                placeholder='Enter collaboration policies'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind !== 'default'}
            />

            {nodeSelectionData.kind === 'rectangle' && (
                <>
                    <LabelWithInfoText
                        label='Ecosystem Organization'
                        infoText={'Is the organisation an approved ecosystem collaborator, or an organisation that is not a formal collaborator in the ecosystem context (e.g. supplier or client)?'}
                    />
                    <Select
                        placeholder='Select the approval state of the organization.'
                        value={nodeSelectionData.ecosystemOrganization}
                        style={{width: '100%'}}
                        disabled={!editEnabled}
                        options={[
                            {value: 'no', label: 'No'},
                            {value: 'yes', label: 'Yes'},
                        ]}
                        onChange={(value) => {
                            updateNodeData({ecosystemOrganization: value});
                        }}
                    />
                </>
            )}

            <LabelWithInfoText
                label='Criticality Level'
                infoText={'On a level of 1 to 5, how does the community assess the criticality level of the service to the region/ecosystem.'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <InputNumber
                field='criticalityLevel'
                min={1}
                max={5}
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
            />

            <LabelWithInfoText
                label='Service Level Agreement'
                infoText={'Key aspects of the type of service level agreements for the specific supply relationship, as defined by contracts and agreements between supplier and consumer of the service. Note that only those aspects of the agreements that are not confidential and add value to the awareness of the ecosystem should be shared. This is intended to capture the actually agreed service level between the service and the customer.'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <MarkdownTextArea
                field='serviceLevelAgreement'
                label='node-serviceLevelAgreement'
                placeholder='Enter Service Level Agreement'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
            />

            <LabelWithInfoText
                label='BC/DR Description'
                infoText={'An optional free-form description of BC/DR relevant aspects related to this service.'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <MarkdownTextArea
                field='bcdrDescription'
                label='node-bcdrDescription'
                placeholder='Enter BC/DR description'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
            />

            <LabelWithInfoText
                label='RTO'
                infoText={'What is the Recovery Time Objective of the service.'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <MarkdownTextArea
                field='rto'
                label='node-rto'
                placeholder='Enter RTO'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
            />

            <LabelWithInfoText
                label='RPO'
                infoText={'What is the Recovery Point Objective of the service from the organisation perspective.'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <MarkdownTextArea
                field='rpo'
                label='node-rpo'
                placeholder='Enter RPO'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
            />

            <LabelWithInfoText
                label='Confidentiality Level'
                infoText={'From the ecosystem perspective, what is the reliance on Confidentiality on a scale from 0 to 5 for this service (0 meaning that confidentiality is not important and 5 meaning that the service requires a high level of confidentiality).'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <InputNumber
                field='confidentialityLevel'
                min={0}
                max={5}
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
            />

            <LabelWithInfoText
                label='Integrity Level'
                infoText={'From the ecosystem perspective, what is the reliance on Integrity on a scale from 0 to 5 for this service (0 meaning that Integrity is not important and 5 meaning that the service requires a high level of Integrity).'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <InputNumber
                field='integrityLevel'
                min={0}
                max={5}
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
            />

            <LabelWithInfoText
                label='Availability Level'
                infoText={'From the ecosystem perspective, what is the reliance on Availability on a scale from 0 to 5 for this service (0 meaning that Availability is not important and 5 meaning that the service requires a high level of Availability).'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <InputNumber
                field='availabilityLevel'
                min={0}
                max={5}
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
            />

            <LabelWithInfoText
                label='CIA Rationale'
                infoText={'CIA (Confidentiality, Integrity, Availability) justification.'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <MarkdownTextArea
                field='ciaRationale'
                label='node-ciaRationale'
                placeholder='Enter CIA Rationale'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
            />

            <LabelWithInfoText
                label='MTPD'
                infoText={'What is the Maximum Tolerable Period of Disruption of the service.'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <MarkdownTextArea
                field='mtpd'
                label='node-mtpd'
                placeholder='Enter MTPD'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
            />

            <LabelWithInfoText
                label='Real-time Status'
                infoText={'The ability to update the service status to its current state. While it can be possible in future to integrate this with service with incidents detected in real-time, currently this is restricted to manual updates of real-time service status via the ecosystem alert channel.'}
                visible={nodeSelectionData.kind === 'oval'}
            />
            <MarkdownTextArea
                field='realtimeStatus'
                label='node-realtimeStatus'
                placeholder='Enter real-time status'
                selectionData={nodeSelectionData}
                editEnabled={editEnabled}
                updateData={updateNodeData}
                visible={nodeSelectionData.kind === 'oval'}
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

                    // TODO: need an enum for this
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

            {(nodeSelectionData.kind === 'default') && (
                <Alert
                    showIcon={true}
                    message={'Change node type to see more of the available fields.'}
                    type='warning'
                    style={{marginTop: '8px'}}
                />)}

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