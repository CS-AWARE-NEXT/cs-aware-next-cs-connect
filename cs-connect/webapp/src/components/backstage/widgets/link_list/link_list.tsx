import React, {Dispatch, SetStateAction, useContext} from 'react';
import {
    Alert,
    Button,
    Card,
    Col,
    Collapse,
    Divider,
    Form,
    Input,
    Row,
    Statistic,
} from 'antd';
import styled from 'styled-components';
import {LinkOutlined} from '@ant-design/icons';
import {useSelector} from 'react-redux';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {useIntl} from 'react-intl';

import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {formatName} from 'src/helpers';
import {LinkListData, LinkListItem} from 'src/types/list';
import {VerticalSpacer} from 'src/components/backstage/grid';
import {deleteLinkListItem, saveLinkListItem} from 'src/clients';

const {Item} = Form;
const {Panel} = Collapse;

type Props = {
    data: LinkListData;
    name: string;
    url?: string;
    parentId: string;
    sectionId: string;
    flexGrow?: number;
    marginRight?: string;
    forceRefresh?: Dispatch<SetStateAction<boolean>>;
    singleLink?: boolean;
};

const chunkItems = (array: any[], size: number): any[] => {
    if (!array) {
        return [];
    }
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += size) {
        chunkedArray.push(array.slice(i, i + size));
    }
    return chunkedArray;
};

const LinkList = ({
    data,
    name = '',
    url = '',
    parentId,
    sectionId,
    flexGrow = 1,
    marginRight = '0',
    singleLink = false,
    forceRefresh,
}: Props) => {
    console.log('parentId', parentId, 'sectionId', sectionId);
    const {formatMessage} = useIntl();
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const organizationId = useContext(OrganizationIdContext);

    const {items} = data;
    const chunkedItems = chunkItems(items, 2);

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    const currentUser = useSelector(getCurrentUser);
    const isUserAdmin = currentUser.roles.includes('system_admin');
    const onFinish = (value: any) => {
        const linkItem = {
            name: value.channelName,
            description: value.channelDescription,
            to: value.channelUrl,
            organizationId,
            parentId,
        };
        console.log(linkItem, value, JSON.stringify(linkItem));
        saveLinkListItem(linkItem, url);
        if (forceRefresh) {
            forceRefresh((prev) => !prev);
        }
    };

    const onDeleteLinkListItem = (linkListItemId: string | undefined) => {
        if (!linkListItemId) {
            console.error('No linkListItemId provided');
            return;
        }
        deleteLinkListItem(linkListItemId, url);
        if (forceRefresh) {
            forceRefresh((prev) => !prev);
        }
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
                {chunkedItems.map((itemPair, index) => (
                    <Row
                        gutter={16}
                        key={index}
                    >
                        {itemPair.map((item: LinkListItem) => (
                            <Col
                                span={singleLink ? 24 : 12}
                                key={item.id}
                            >
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
                                                    icon={<LinkOutlined/>}
                                                >
                                                    <a
                                                        href={item.to}
                                                        style={{textDecoration: 'none', color: 'white', marginLeft: '8px'}}
                                                    >
                                                        {`Go to '${item.name}' channel`}
                                                    </a>
                                                </Button>
                                                {isUserAdmin &&
                                                    <Button
                                                        style={{marginLeft: '8px'}}
                                                        onClick={() => onDeleteLinkListItem(item.id)}
                                                        key='delete'
                                                        type='primary'
                                                        danger={true}
                                                    >
                                                        {'Delete'}
                                                    </Button>}
                                                <Divider>{'Channel Description'}</Divider>
                                            </>
                                        )}
                                        value={item.description}
                                        valueStyle={{fontSize: '17px'}}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ))}

                <VerticalSpacer size={24}/>

                {isUserAdmin &&
                    <>
                        <Alert
                            message={formatMessage({defaultMessage: 'This is visible only to you because you are an admin!'})}
                            type='warning'
                            style={{maxWidth: 1000}}
                        />
                        <VerticalSpacer size={24}/>
                        <Collapse
                            size='small'
                            style={{maxWidth: 1000}}
                        >
                            <Panel
                                id={'add-channel-panel'}
                                key={'add-channel-panel'}
                                header={'Add Channel Link'}
                                forceRender={true}
                            >
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
                                </Form>
                            </Panel>
                        </Collapse>
                    </>}
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
