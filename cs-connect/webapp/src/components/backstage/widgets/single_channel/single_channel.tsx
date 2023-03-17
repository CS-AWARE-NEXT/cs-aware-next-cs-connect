import React, {useContext} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {PARENT_ID_PARAM} from 'src/constants';

import SingleChannelBox from './single_channel_box';

type Props = {
    parentId: string;
    sectionId: string;
    teamId: string;
};

const SingleChannel = ({parentId, sectionId, teamId}: Props) => {
    const fullUrl = useContext(FullUrlContext);
    const {formatMessage} = useIntl();

    const id = 'single-channel-widget';
    const title = formatMessage({defaultMessage: 'Related Channel'});

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
            <SingleChannelBox
                parentId={parentId}
                sectionId={sectionId}
                teamId={teamId}
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

export default SingleChannel;