import {
    Button,
    Form,
    Input,
    Modal,
    Select,
} from 'antd';
import {getCurrentUserId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';
import React, {useEffect, useState} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {LockOutlined} from '@ant-design/icons';

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
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (organizations.length && !options) {
            const orgs = organizations.map((org: Organization) => ({value: org.id, label: org.name}));
            orgs.push({value: ORGANIZATION_ID_ALL, label: 'All'});
            setOptions(orgs);
        }
    }, [organizations]);

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

        if (selectedObject.value === ORGANIZATION_ID_ALL) {
            setIsPasswordModalOpen(true);
            return;
        }

        async function setUserOrganizationAsync() {
            setUserOrganization({teamId, userId, orgId: selectedObject.value});
            setUserProps({orgId: selectedObject.value});
        }

        setUserOrganizationAsync();
    }, [selectedObject]);

    useEffect(() => {
        if (isPasswordInvalid) {
            form.validateFields();
        }
    }, [isPasswordInvalid]);

    const onFinish = async (values: FieldType) => {
        setConfirmLoading(true);

        try {
            await setUserOrganization({teamId, userId, orgId: selectedObject.value, password: values.password});
        } catch (e) {
            setConfirmLoading(false);
            setIsPasswordInvalid(true);
            return;
        }
        setUserProps({orgId: selectedObject.value});

        setConfirmLoading(false);

        setIsPasswordModalOpen(false);
    };

    const closeModal = () => {
        setIsPasswordModalOpen(false);
        setSelectedObject(defaultSelectObject);
        setDisabled(false);
        setIsPasswordInvalid(false);
    };

    if (userProps && userProps.orgId && selectedObject !== defaultSelectObject) {
        return <StyledContainer>{selectedObject.label}</StyledContainer>;
    }

    const filterOption = (input: string, option?: any) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    return (
        <>
            <Modal
                open={isPasswordModalOpen}
                width={'20vw'}
                title={'View all organizations'}
                centered={true}
                onCancel={closeModal}
                confirmLoading={confirmLoading}
                destroyOnClose={true}
                footer={[]}
            >
                <FormattedMessage defaultMessage='You need to be an administrator to view all the organizations.'/>
                <Form
                    name='set_org_pw_check'
                    form={form}
                    onFinish={onFinish}
                    style={{paddingTop: '15px'}}
                    onChange={() => {
                        if (isPasswordInvalid) {
                            setIsPasswordInvalid(false);
                        }
                    }}
                >
                    <Form.Item
                        name='password'
                        rules={[
                            {required: true, message: 'Input the administrator password.'},
                            () => ({
                                validator() {
                                    if (isPasswordInvalid) {
                                        return Promise.reject(new Error('The password is incorrect.'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <Input
                            prefix={<LockOutlined className='site-form-item-icon'/>}
                            type='password'
                            placeholder='Password'
                            autoFocus={true}
                        />
                    </Form.Item>

                    <Form.Item wrapperCol={{offset: 8, span: 16}}>
                        <Button
                            type='primary'
                            htmlType='submit'
                        >
                            <FormattedMessage defaultMessage='Confirm'/>
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Placeholder will never appear because the defaultSelectObject sets a value already */}
            <StyledSelect
                value={selectedObject.value}
                disabled={disabled}
                showSearch={true}
                style={{width: '100%'}}
                placeholder={formatMessage({defaultMessage: 'Select your organization'})}
                optionFilterProp='children'
                filterOption={filterOption}

                options={options}
                onChange={(value: any, option: any) => setSelectedObject({value, label: option.label})}
            />
        </>
    );
};

const StyledSelect = styled(Select)`
    background: var(--center-channel-bg);
`;

const StyledContainer = styled.div`
	color: rgba(var(--sidebar-text-rgb), 0.6);
	font-family: "Open Sans",sans-serif;
	font-size: 12px;
	font-weight: 600;
	text-align: left;
	text-transform: uppercase;
	white-space: nowrap;
	padding-left: 16px;
`;

type FieldType = {
    password?: string;
};

export default LHSView;
