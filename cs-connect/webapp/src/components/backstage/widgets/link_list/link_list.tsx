import React, {useContext} from 'react';
import {
    Alert,
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    Row,
    Statistic,
} from 'antd';
import styled from 'styled-components';
import {useRouteMatch} from 'react-router-dom';
import {LinkOutlined} from '@ant-design/icons';
import {useSelector} from 'react-redux';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {useIntl} from 'react-intl';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery, useUrlHash} from 'src/hooks';
import {formatName} from 'src/helpers';
import {ListData} from 'src/types/list';
import {HyperlinkPathContext} from 'src/components/rhs/rhs_shared';
import {navigateToChannel} from 'src/browser_routing';
import {teamNameSelector} from 'src/selectors';
import {VerticalSpacer} from 'src/components/backstage/grid';

const {Item} = Form;

type Props = {
    data: ListData;
    name: string;
    parentId: string;
    sectionId: string;
    flexGrow?: number;
    marginRight?: string;
};

const LinkList = ({
    data,
    name = '',
    parentId,
    sectionId,
    flexGrow = 1,
    marginRight = '0',
}: Props) => {
    const {formatMessage} = useIntl();
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const {url} = useRouteMatch();
    const urlHash = useUrlHash();
    const hyperlinkPathContext = useContext(HyperlinkPathContext);
    const hyperlinkPath = `${hyperlinkPathContext}.${name}`;

    const {items} = data;
    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    const teamId = useSelector(getCurrentTeamId);
    const team = useSelector(teamNameSelector(teamId));

    const currentUser = useSelector(getCurrentUser);
    const isUserAdmin = currentUser.roles.includes('system_admin');
    const onFinish = (value: object) => {
        console.log(value);
    };

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <ListHeader
                flexGrow={flexGrow}
                marginRight={marginRight}
            >
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={ecosystemQuery}
                    text={name}
                    title={name}
                />
            </ListHeader>
            <>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card
                            bordered={true}
                            style={{height: '200px'}}
                        >
                            <Statistic
                                title={(
                                    <>
                                        <Button
                                            key='submit'
                                            type='primary'
                                            onClick={() => navigateToChannel(team.name, 'town-square')}
                                            icon={<LinkOutlined/>}
                                        >
                                            {'Go to \'Ecosystem People\' channel'}
                                        </Button>
                                        <Divider>{'Channel Description'}</Divider>
                                    </>
                                )}
                                value={'Present yourself and meet others in the ecosystem!'}
                                valueStyle={{fontSize: '17px'}}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card
                            bordered={true}
                            style={{height: '200px'}}
                        >
                            <Statistic
                                title={(
                                    <>
                                        <Button
                                            key='submit'
                                            type='primary'
                                            onClick={() => navigateToChannel(team.name, 'fabw8i8kw3nk7fmpmrpgpjt97r')}
                                            icon={<LinkOutlined/>}
                                        >
                                            {'Go to \'Code of Conduct\' channel'}
                                        </Button>
                                        <Divider>{'Channel Description'}</Divider>
                                    </>
                                )}
                                value={'In this channel you will find the code of conduct for CS-CONNECT and instructions on how to collaborate on the platform.'}
                                valueStyle={{fontSize: '17px'}}
                            />
                        </Card>
                    </Col>
                </Row>

                <VerticalSpacer size={24}/>

                {isUserAdmin &&
                    <>
                        <Alert
                            message={formatMessage({defaultMessage: 'This is visible only to you because you are an admin!'})}
                            type='warning'
                            style={{maxWidth: 1000}}
                        />
                        <VerticalSpacer size={24}/>
                    </>}

                {/* Only the admin can add channels here */}
                {isUserAdmin &&
                    <Form
                        name='channelCreation'
                        layout='vertical'
                        style={{maxWidth: 1000}}
                        onFinish={onFinish}
                    >
                        <Item
                            name='channelName'
                            label='Channel Name'
                            rules={[{required: true}]}
                        >
                            <Input placeholder='Insert channel name'/>
                        </Item>

                        <Item
                            name='channelDescription'
                            label='Channel Description'
                            rules={[{required: true}]}
                        >
                            <Input placeholder='Insert channel description'/>
                        </Item>

                        <Item
                            name='channelUrl'
                            label='Channel URL'
                            rules={[{required: true}]}
                        >
                            <Input placeholder='Insert channel URL'/>
                        </Item>

                        <Button
                            type='primary'
                            htmlType='submit'
                        >
                            {'Add Channel'}
                        </Button>
                    </Form>}
            </>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

const ListHeader = styled(Header)<{flexGrow: number; marginRight: string}>`
    /* box-shadow: inset 0px -1px 0px rgba(var(--center-channel-color-rgb), 0.16); */
    flex-grow: ${(props) => props.flexGrow};
    margin-right: ${(props) => props.marginRight};
    margin-bottom: 16px;
`;

const FormContainer = styled(Form)`
    /* margin-top: 24px; */
`;

export default LinkList;
