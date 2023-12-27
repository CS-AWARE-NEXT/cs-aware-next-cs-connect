import {Avatar, List, Select} from 'antd';
import {UserOutlined} from '@ant-design/icons';
import React, {Dispatch, SetStateAction, useState} from 'react';
import styled from 'styled-components';
import {cloneDeep} from 'lodash';
import {FormattedMessage} from 'react-intl';

import {PrimaryButtonLarger} from 'src/components/backstage/widgets/shared';
import {StepRole} from 'src/types/scenario_wizard';
import {useAllUsersOptions} from 'src/hooks';
import {AutoSizeDeleteIcon} from 'src/components/commons/delete_action';

const {Item} = List;
const {Meta} = Item;

type Props = {
    data: StepRole[];
    setWizardData: Dispatch<SetStateAction<any>>;
};

const RolesStep = ({data, setWizardData}: Props) => {
    const [roles, setRoles] = useState(data);
    const usersOptions = useAllUsersOptions();

    return (
        <Container>
            <PrimaryButtonLarger
                onClick={() => setRoles((prev) => ([...prev, {userId: '', roles: []}]))}
            >
                <FormattedMessage defaultMessage='Add a role'/>
            </PrimaryButtonLarger>
            {usersOptions.length &&
                <List
                    style={{padding: '16px'}}
                    itemLayout='horizontal'
                    dataSource={roles}
                    renderItem={(role, index) => (
                        <Item
                            actions={[
                                <StyledDeleteAction
                                    key={`role-${index}-delete`}
                                    onClick={() => {
                                        const currentRoles = [...roles.filter((prevRole) => prevRole !== role)];
                                        setRoles(currentRoles);
                                        setWizardData((prev: any) => ({...prev, roles: currentRoles}));
                                    }}
                                    className={'icon-trash-can-outline'}
                                    clicked={false}
                                />,
                            ]}
                        >
                            <Meta
                                avatar={<Avatar icon={<UserOutlined/>}/>}
                            />
                            <div style={{width: '50%'}}>
                                <Text>{'User'}</Text>
                                <Select
                                    style={{width: '90%'}}
                                    value={role.userId}
                                    options={usersOptions}
                                    placeholder='Select a user'
                                    onChange={(value) => {
                                        const currentRoles = cloneDeep(roles);
                                        currentRoles[index].userId = value;
                                        setRoles(currentRoles);
                                        setWizardData((prev: any) => ({...prev, roles: currentRoles}));
                                    }}
                                />
                            </div>
                            <div style={{width: '50%'}}>
                                <Text>{'Roles'}</Text>
                                <Select
                                    style={{width: '90%'}}
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
                        </Item>
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

const StyledDeleteAction = styled(AutoSizeDeleteIcon)`
    border-radius: 4px;
    font-size: 18px;
    width: 28px;
    height: 28px;
    margin-left: 4px;
    display: grid;
    place-items: center;
`;

export default RolesStep;
