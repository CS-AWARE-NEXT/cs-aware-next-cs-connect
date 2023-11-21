import {Select} from 'antd';
import {getCurrentUserId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';
import React, {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import styled from 'styled-components';

import {setUserOrganization} from 'src/clients';

import {useOrganizionsNoEcosystem, useUserProps} from 'src/hooks';

import {SelectObject, defaultSelectObject} from 'src/types/object_select';
import {ORGANIZATION_ID_ALL, Organization} from 'src/types/organization';

const LHSView = () => {
    const [selectedObject, setSelectedObject] = useState<SelectObject>(defaultSelectObject);
    const [disabled, setDisabled] = useState<boolean>(false);
    const {formatMessage} = useIntl();
    const organizations = useOrganizionsNoEcosystem();
    const [options, setOptions] = useState<SelectObject[]>();
    const teamId = useSelector(getCurrentTeamId);
    const userId = useSelector(getCurrentUserId);
    const [userProps, setUserProps] = useUserProps();

    useEffect(() => {
        if (organizations.length) {
            const orgs = organizations.map((org: Organization) => ({value: org.id, label: org.name}));
            orgs.push({value: ORGANIZATION_ID_ALL, label: 'All'});
            setOptions(orgs);
        }
    }, []);

    useEffect(() => {
        if (userProps) {
            const orgId = userProps.orgId;
            if (orgId) {
                if (orgId === ORGANIZATION_ID_ALL) {
                    setSelectedObject({value: ORGANIZATION_ID_ALL, label: 'All'});
                    setDisabled(true);
                } else {
                    const organization = organizations.find((org) => org.id === orgId);
                    if (organization) {
                        setSelectedObject({value: organization?.id, label: organization.name});
                        setDisabled(true);
                    }
                }
            }
        }
    }, [userProps]);

    useEffect(() => {
        if (selectedObject === defaultSelectObject || (userProps && userProps.orgId === selectedObject.value)) {
            return;
        }
        async function setUserOrganizationAsync() {
            setUserOrganization({teamId, userId, orgId: selectedObject.value});
            setUserProps({orgId: selectedObject.value});
        }

        setUserOrganizationAsync();
    }, [selectedObject]);

    return (
        <StyledSelect
            value={selectedObject.value}
            disabled={disabled}
            showSearch={true}
            style={{width: '100%'}}
            placeholder={formatMessage({defaultMessage: 'Search or select'})}
            optionFilterProp='children'

            options={options}
            onChange={(value: any) => setSelectedObject({value, label: value})}
        />
    );
};

const StyledSelect = styled(Select)`
    background: var(--center-channel-bg);
`;

export default LHSView;
