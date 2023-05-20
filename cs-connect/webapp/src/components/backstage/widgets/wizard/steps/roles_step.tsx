import {Avatar, List, Select} from 'antd';
import {UserOutlined} from '@ant-design/icons';
import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useState,
} from 'react';
import styled from 'styled-components';
import {cloneDeep} from 'lodash';
import {useSelector} from 'react-redux';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';
import {FormattedMessage} from 'react-intl';

import {PrimaryButtonLarger} from 'src/components/backstage/widgets/shared';
import {fetchAllUsers} from 'src/clients';

type Props = {
    data: any[];
    setWizardData: Dispatch<SetStateAction<any>>;
};

const RolesStep = ({data, setWizardData}: Props) => {
    const [roles, setRoles] = useState<any[]>(data);
    const [users, setUsers] = useState<any[]>([]);
    const teamId = useSelector(getCurrentTeamId);

    useEffect(() => {
        let isCanceled = false;
        async function fetchAllUsersAsync() {
            const result = await fetchAllUsers(teamId);
            console.log({result});
            if (!isCanceled) {
                const userRules = result.users.map((user) => ({
                    value: user.userId,
                    label: `${user.firstName} ${user.lastName} (${user.username})`,
                }));
                setUsers(userRules);
            }
        }

        fetchAllUsersAsync();

        return () => {
            isCanceled = true;
        };
    }, []);

    return (
        <Container>
            <PrimaryButtonLarger
                onClick={() => setRoles((prev) => ([...prev, {user: '', roles: []}]))}
            >
                <FormattedMessage defaultMessage='Add a role'/>
            </PrimaryButtonLarger>
            {users.length &&
                <List
                    style={{padding: '16px'}}
                    itemLayout='horizontal'
                    dataSource={roles}
                    renderItem={(role, index) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined/>}/>}
                            />
                            <div style={{width: '50%'}}>
                                <Text>{'User'}</Text>
                                <Select
                                    style={{width: '85%'}}
                                    value={role.user}
                                    options={users}
                                    placeholder='Select a user'
                                    onChange={(value) => {
                                        const currentRoles = cloneDeep(roles);
                                        currentRoles[index].user = value;
                                        setRoles(currentRoles);
                                        setWizardData((prev: any) => ({...prev, roles: currentRoles}));
                                    }}
                                />
                            </div>
                            <div style={{width: '50%'}}>
                                <Text>{'Roles'}</Text>
                                <Select
                                    style={{width: '85%'}}
                                    value={role.roles}
                                    mode='tags'
                                    placeholder='Add a role'
                                    onChange={(value) => {
                                        const currentRoles = cloneDeep(roles);
                                        currentRoles[index].roles = value;
                                        setRoles(currentRoles);
                                        setWizardData((prev: any) => ({...prev, roles: currentRoles}));
                                    }}
                                />
                            </div>
                        </List.Item>
                    )}
                />}
        </Container>
    );
};

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

const Text = styled.div`
    text-align: left;
`;

export default RolesStep;
