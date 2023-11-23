import React, {useContext} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {PARENT_ID_PARAM} from 'src/constants';

import ChannelBox from './channel_box';

type Props = {
    parentId: string;
    sectionId: string;
    teamId: string;
    userId: string;
    organizationId: string;
};

const ChannelsSection = ({parentId, sectionId, teamId, userId, organizationId}: Props) => {
    const fullUrl = useContext(FullUrlContext);
    const {formatMessage} = useIntl();

    const id = 'channels-widget';
    const title = formatMessage({defaultMessage: 'Channels'});

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={`${PARENT_ID_PARAM}=${parentId}`}
                    text={title}
                    title={title}
                />
            </Header>
            <ChannelBox
                parentId={parentId}
                sectionId={sectionId}
                teamId={teamId}
                userId={userId}
                organizationId={organizationId}
            />
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default ChannelsSection;
