
import {Modal, Popconfirm} from 'antd';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {CloseIcon} from '@mattermost/compass-icons/components';

import {editEcosystemGraphSelector} from 'src/selectors';

import {StyledEcosystemGraphWrapper} from 'src/components/backstage/widgets/graph/wrappers/ecosystem_graph_wrapper';
import {buildEcosystemGraphUrl, useSection} from 'src/hooks';
import {editEcosystemgraphAction} from 'src/actions';
import {getSystemConfig} from 'src/config/config';

type Props = {
    parentId: string,
    sectionId: string
};

// Modal based ecosystem graph
const EcosystemGraphEditor = ({parentId, sectionId}: Props) => {
    const reduxAction = useSelector(editEcosystemGraphSelector);
    const [modalVisible, setModalVisible] = useState(false);
    const [popConfirmVisible, setPopConfirmVisible] = useState(false);
    const dispatch = useDispatch();
    const section = useSection(parentId);
    const ecosystemGraphUrl = buildEcosystemGraphUrl(section.url, true);
    const [refreshNodeInternals, setRefreshNodeInternals] = useState({});
    const systemConfig = getSystemConfig();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (reduxAction.visible) {
            setModalVisible(true);
        }
    }, [reduxAction]);

    return (
        <>
            <Modal
                open={modalVisible}
                width={'70vw'}
                bodyStyle={{height: '70vh'}}
                title={''}
                centered={true}
                destroyOnClose={true}
                onCancel={() => {
                    if (systemConfig.ecosystemGraphAutoSave || !isEditing) {
                        setModalVisible(false);
                        dispatch(editEcosystemgraphAction(false));
                    } else if (!popConfirmVisible) { // This check is needed due to the PopConfirm click triggering another click on the modal close button
                        setPopConfirmVisible(true);
                    }
                }}
                closeIcon={systemConfig.ecosystemGraphAutoSave ? null : (
                    <Popconfirm
                        title='Close Ecosystem Graph'
                        description='Do you want to close the ecosystem graph without saving it?'
                        onConfirm={() => {
                            setPopConfirmVisible(false);
                            setModalVisible(false);
                            dispatch(editEcosystemgraphAction(false));
                        }}
                        onCancel={() => {
                            setPopConfirmVisible(false);
                        }}
                        okText='Yes'
                        cancelText='No'
                        open={popConfirmVisible}
                    >
                        <CloseIcon/>
                    </Popconfirm>
                )}
                footer={[]}
                afterOpenChange={() => {
                // The modal animation interferes with react flow. We need to notify when the animation finishes to recalculate the transforms.
                    setRefreshNodeInternals({});
                }}
            >
                <StyledEcosystemGraphWrapper
                    name='Edit Ecosystem Graph'
                    editable={true}
                    url={ecosystemGraphUrl}
                    refreshNodeInternalsParent={refreshNodeInternals}
                    setEditMode={setIsEditing}
                />
            </Modal>
        </>
    );
};

export default EcosystemGraphEditor;
