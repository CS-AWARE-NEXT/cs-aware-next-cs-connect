import React, {useState} from 'react';
import styled from 'styled-components';
import {FormattedMessage} from 'react-intl';

import {PrimaryButtonLarger} from 'src/components/backstage/widgets/shared';
import {ElementData} from 'src/types/scenario_wizard';

import ScenarioWizardModal from './scenario_wizard_modal';

type Props = {
    organizationsData: ElementData[];
    name: string;
    parentId: string;
    targetUrl: string;
};

const ScenarioWizard = ({
    organizationsData,
    name,
    parentId,
    targetUrl,
}: Props) => {
    const [visible, setVisible] = useState(false);

    return (
        <Container>
            <ButtonContainer>
                <PrimaryButtonLarger onClick={() => setVisible(true)}>
                    <FormattedMessage defaultMessage='Create'/>
                </PrimaryButtonLarger>
            </ButtonContainer>
            <ScenarioWizardModal
                organizationsData={organizationsData}
                name={name}
                parentId={parentId}
                targetUrl={targetUrl}
                visible={visible}
                setVisible={setVisible}
            />
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

const ButtonContainer = styled.div`
    width: 50px;
`;

export default ScenarioWizard;
