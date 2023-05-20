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

const RulesStep = ({data, setWizardData}: Props) => {
    const [rules, setRules] = useState<any[]>(data);
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
                onClick={() => setRules((prev) => ([...prev, {user: '', rules: []}]))}
            >
                <FormattedMessage defaultMessage='Add a new rule'/>
            </PrimaryButtonLarger>
            {users.length &&
                <List
                    style={{padding: '16px'}}
                    itemLayout='horizontal'
                    dataSource={rules}
                    renderItem={(rule, index) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined/>}/>}
                            />
                            <div style={{width: '50%'}}>
                                <Text>{'User'}</Text>
                                <Select
                                    value={rule.user}
                                    style={{width: '80%'}}
                                    options={users}
                                    placeholder='Select a user'
                                    onChange={(value) => {
                                        const currentRules = cloneDeep(rules);
                                        currentRules[index].user = value;
                                        setRules(currentRules);
                                        setWizardData((prev: any) => ({...prev, rules: currentRules}));
                                    }}
                                />
                            </div>
                            <div style={{width: '50%'}}>
                                <Text>{'Rules'}</Text>
                                <Select
                                    value={rule.rules}
                                    mode='tags'
                                    style={{width: '80%'}}
                                    placeholder='Add a rule'
                                    onChange={(value) => {
                                        const currentRules = cloneDeep(rules);
                                        currentRules[index].rules = value;
                                        setRules(currentRules);
                                        setWizardData((prev: any) => ({...prev, rules: currentRules}));
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

export default RulesStep;
