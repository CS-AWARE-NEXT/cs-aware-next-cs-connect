
import {Modal} from 'antd';
import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import styled from 'styled-components';

import {editEcosystemGraphSelector} from 'src/selectors';

import EcosystemGraphWrapper from 'src/components/backstage/widgets/graph/wrappers/ecosystem_graph_wrapper';
import {buildEcosystemGraphUrl, useSection} from 'src/hooks';
import {editEcosystemgraphAction} from 'src/actions';

type Props = {
    parentId: string,
    sectionId: string
};

// Modal based ecosystem graph
export const EcosystemGraphEditor = ({parentId, sectionId}: Props) => {
    const reduxAction = useSelector(editEcosystemGraphSelector);
    const [modalVisible, setModalVisible] = useState(false);
    const dispatch = useDispatch();
    const section = useSection(parentId);
    const ecosystemGraphUrl = buildEcosystemGraphUrl(section.url, true);
    const [refreshNodeInternals, setRefreshNodeInternals] = useState({});

    useEffect(() => {
        if (reduxAction.visible) {
            setModalVisible(true);
        }
    }, [reduxAction]);

    return (
        <Modal
            open={modalVisible}
            width={'70vw'}
            bodyStyle={{height: '70vh'}}
            title={''}
            centered={true}
            destroyOnClose={true}
            onCancel={() => {
                setModalVisible(false);
                dispatch(editEcosystemgraphAction(false));
            }}
            footer={[]}
            afterOpenChange={() => {
                // The modal animation interferes with react flow. We need to notify when the animation finishes to recalculate the transforms.
                setRefreshNodeInternals({});
            }}
        >
            <StyledEcosystemGraphWrapper
                name='Edit ecosystem graph'
                editable={true}
                url={ecosystemGraphUrl}
                refreshNodeInternals={refreshNodeInternals}
            />
        </Modal>
    );
};

const StyledEcosystemGraphWrapper = styled(EcosystemGraphWrapper)`
height: 100%;
`;
