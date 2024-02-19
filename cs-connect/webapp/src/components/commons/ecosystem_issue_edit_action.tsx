import React, {FC, HTMLAttributes, useState} from 'react';
import {useIntl} from 'react-intl';
import styled, {css} from 'styled-components';

import Tooltip from 'src/components/commons/tooltip';
import {OVERLAY_DELAY} from 'src/constants';

import {useOrganizionsNoEcosystem} from 'src/hooks';

import {useStepData} from 'src/components/backstage/organizations/ecosystem/ecosystem_details';

import ScenarioWizardModal from 'src/components/backstage/widgets/wizard/scenario_wizard_modal';
import {Organization, SectionInfo} from 'src/types/organization';

type Props = {
    id: string;
    ecosystem: Organization;
    iconWidth?: string;
    iconHeight?: string;
    sectionInfo?: SectionInfo;
    setSectionInfo?: React.Dispatch<React.SetStateAction<SectionInfo | undefined>>;
};

type Attrs = HTMLAttributes<HTMLElement>;

// Might be worth merging with copylink since the two act in a very similar way
const EcosystemIssueEditAction: FC<Props & Attrs> = ({
    iconWidth,
    iconHeight,
    id,
    sectionInfo,
    setSectionInfo,
    ecosystem,
    ...attrs
}) => {
    const {formatMessage} = useIntl();
    const organizations = useOrganizionsNoEcosystem();
    const [currentSection, _] = useState(0);
    const [stepData, _setStepData] = useStepData(organizations);
    const [visible, setVisible] = useState(false);

    const triggerEdit = () => {
        setVisible(true);
    };

    return (
        <>
            <Tooltip
                id={id}
                placement='bottom'
                delay={OVERLAY_DELAY}
                shouldUpdatePosition={true}
                content={formatMessage({defaultMessage: 'Edit issue'})}
            >
                <AutoSizeEditIcon
                    onClick={triggerEdit}
                    clicked={false}
                    {...attrs}
                    className={'icon-pencil-outline ' + attrs.className}
                    iconWidth={iconWidth}
                    iconHeight={iconHeight}
                />
            </Tooltip>
            {ecosystem &&
            <ScenarioWizardModal
                organizationsData={stepData}
                name={ecosystem.sections[currentSection].name}
                parentId={ecosystem.sections[currentSection].id}
                targetUrl={ecosystem.sections[currentSection].url}
                visible={visible}
                setVisible={setVisible}
                prefillWizardData={sectionInfo}
                wizardDataSetter={setSectionInfo}
                isEdit={true}
            />
            }
        </>
    );
};

const EditIcon = styled.button<{clicked: boolean, iconWidth?: string, iconHeight?: string}>`
    display: inline-block;

    border-radius: 4px;
    padding: 0;
    width: ${(props) => (props.iconWidth ? props.iconWidth : '1.5em')};
    height: ${(props) => (props.iconHeight ? props.iconHeight : '1.5em')};

    :before {
        margin: 0;
        vertical-align: baseline;
    }

    border: none;
    background: transparent;
    color: rgba(var(--center-channel-color-rgb), 0.56);


    ${({clicked}) => !clicked && css`
        &:hover {
            background: var(--center-channel-color-08);
            color: var(--center-channel-color-72);
        }
    `}

    ${({clicked}) => clicked && css`
        background: var(--button-bg-08);
        color: var(--button-bg);
    `}
`;

const AutoSizeEditIcon = styled(EditIcon)`
    font-size: inherit;
`;

export default styled(EcosystemIssueEditAction)``;
