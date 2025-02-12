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
import InputNumber from './input_number';

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
                label='Criticality Level'
                infoText={'On a level of 1 to 5, how does the community assess the criticality level of the supplied service to the consuming service/organisation. At least the provider and the consumer should contribute to the detemination of the criticality level.'}
            />
            <InputNumber
                field='criticalityLevel'
                min={1}
                max={5}
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
            />

            <LabelWithInfoText
                label='Service Level Agreement'
                infoText={'Key aspects of the type of service level agreements for the specific supply relationship, as defined by contracts and agreements between supplier and consumer of the service. Note that only those aspects of the agreements that are not confidential and add value to the awareness of the ecosystem should be shared. This is intended to capture the actually agreed service level between the service and the customer.'}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />
            <MarkdownTextArea
                field='serviceLevelAgreement'
                label='edge-serviceLevelAgreement'
                placeholder='Enter Service Level Agreement'
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />

            <LabelWithInfoText
                label='BC/DR Description'
                infoText={'An optional free-form description of BC/DR relevant aspects related to this service.'}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />
            <MarkdownTextArea
                field='bcdrDescription'
                label='edge-bcdrDescription'
                placeholder='Enter BC/DR description'
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />

            <LabelWithInfoText
                label='RTO'
                infoText={'What is the Recovery Time Objective of the service.'}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />
            <MarkdownTextArea
                field='rto'
                label='edge-rto'
                placeholder='Enter RTO'
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />

            <LabelWithInfoText
                label='RPO'
                infoText={'What is the Recovery Point Objective of the service from the organisation perspective.'}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />
            <MarkdownTextArea
                field='rpo'
                label='edge-rpo'
                placeholder='Enter RPO'
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />

            <LabelWithInfoText
                label='Confidentiality Level'
                infoText={'From the organisation perspective, what is the reliance on Confidentiality on a scale from 0 to 5 for this service (0 meaning that confidentiality is not important and 5 meaning that the service requires a high level of confidentiality).'}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />
            <InputNumber
                field='confidentialityLevel'
                min={0}
                max={5}
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />

            <LabelWithInfoText
                label='Integrity Level'
                infoText={'From the organisation perspective, what is the reliance on Integrity on a scale from 0 to 5 for this service (0 meaning that Integrity is not important and 5 meaning that the service requires a high level of Integrity).'}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />
            <InputNumber
                field='integrityLevel'
                min={0}
                max={5}
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />

            <LabelWithInfoText
                label='Availability Level'
                infoText={'From the organisation perspective, what is the reliance on Availability on a scale from 0 to 5 for this service (0 meaning that Availability is not important and 5 meaning that the service requires a high level of Availability).'}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />
            <InputNumber
                field='availabilityLevel'
                min={0}
                max={5}
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />

            <LabelWithInfoText
                label='CIA Rationale'
                infoText={'CIA (Confidentiality, Integrity, Availability) justification.'}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />
            <MarkdownTextArea
                field='ciaRationale'
                label='edge-ciaRationale'
                placeholder='Enter CIA Rationale'
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />

            <LabelWithInfoText
                label='MTPD'
                infoText={'What is the Maximum Tolerable Period of Disruption of the service.'}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />
            <MarkdownTextArea
                field='mtpd'
                label='edge-mtpd'
                placeholder='Enter MTPD'
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />

            <LabelWithInfoText
                label='Real-time Status'
                infoText={'The ability to update the service status for specific supply relationships to its current state. While it can be possible in future to integrate this with service with incidents detected in real-time, currently this is restricted to manual updates of real-time service status via the ecosystem alert channel.'}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
            />
            <MarkdownTextArea
                field='realtimeStatus'
                label='edge-realtimeStatus'
                placeholder='Enter real-time status'
                selectionData={edgeSelectionData}
                editEnabled={editEnabled}
                updateData={updateEdgeData}
                visible={edgeSelectionData.kind === EDGE_TYPE_SUPPLIED_BY}
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