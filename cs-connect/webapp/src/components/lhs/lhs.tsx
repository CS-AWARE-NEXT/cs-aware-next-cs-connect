import {Select} from 'antd';
import {getCurrentUserId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';
import React, {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {setUserOrganization} from 'src/clients';

import {useOrganizionsNoEcosystem, useUserProps} from 'src/hooks';

import {SelectObject, defaultSelectObject} from 'src/types/object_select';
import {Organization} from 'src/types/organization';

const LHSView = () => {
    const [selectedObject, setSelectedObject] = useState<SelectObject>(defaultSelectObject);
    const {formatMessage} = useIntl();
    const organizations = useOrganizionsNoEcosystem();
    const [options, setOptions] = useState<SelectObject[]>();
    const teamId = useSelector(getCurrentTeamId);
    const userId = useSelector(getCurrentUserId);
    const [userProps, setUserProps] = useUserProps();

    useEffect(() => {
        if (organizations.length) {
            setOptions(organizations.map((org: Organization) => ({value: org.id, label: org.name})));
        }
    }, []);

    useEffect(() => {
        if (userProps) {
            const orgId = userProps.orgId;
            if (orgId) {
                const organization = organizations.find((org) => org.id === orgId);
                if (organization) {
                    setSelectedObject({value: organization?.id, label: organization.name});
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
        <Select
            value={selectedObject.value}
            showSearch={true}
            style={{width: '100%'}}
            placeholder={formatMessage({defaultMessage: 'Search or select'})}
            optionFilterProp='children'

            options={options}
            onChange={(value) => setSelectedObject({value, label: value})}
        />
    );
};

export default LHSView;
