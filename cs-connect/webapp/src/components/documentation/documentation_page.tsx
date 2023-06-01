import React from 'react';
import {useIntl} from 'react-intl';
import styled from 'styled-components';
import {useLocation} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {getCurrentTeamId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/teams';

import {
    Body,
    Container,
    Main,
    MainWrapper,
} from 'src/components/backstage/shared';
import PageHeader from 'src/components/commons/header';
import {useScrollIntoView} from 'src/hooks';
import {getSiteUrl} from 'src/clients';
import {teamNameSelector} from 'src/selectors';

import {DocumentationItem} from './documentation';
import DocumentationItemView from './documentation_item';

type Props = {
    items: DocumentationItem[];
};

const DocumentationPage = ({items}: Props) => {
    const {formatMessage} = useIntl();
    const teamId = useSelector(getCurrentTeamId);
    let team = useSelector(teamNameSelector(teamId));
    if (!teamId) {
        team = {...team, name: 'all-teams', display_name: 'All Teams', description: 'No team is selected'};
    }
    const {hash: urlHash} = useLocation();
    useScrollIntoView(urlHash);

    return (
        <OuterContainer>
            <PageHeader
                data-testid='titleDocumentation'
                level={2}
                heading={formatMessage({defaultMessage: 'Documentation'})}
                subtitle={formatMessage({defaultMessage: 'Documentation about the platform'})}
                css={`
                    border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
                `}
                right={<a href={`${getSiteUrl()}/${team.name}/channels/`}>{'Back to channels'}</a>}
            />
            <Container>
                <Wrapper>
                    <Spacer/>
                    <MainBody>
                        <Body>
                            {items.map((item) => (
                                <DocumentationItemView
                                    key={item.id}
                                    item={item}
                                />
                            ))}
                        </Body>
                    </MainBody>
                </Wrapper>
            </Container>
        </OuterContainer>
    );
};

const OuterContainer = styled.div`
    flex: 1 1 auto;
`;

const Wrapper = styled(MainWrapper)`
    grid-template-rows: 16px 1fr;
`;

// TODO: maybe this has to be removed and the documentation page has to be redesigned
const MainBody = styled(Main)`
    place-content: start center;
    grid-auto-columns: min(780px, 100%);    
`;

const Spacer = styled.div``;

export default DocumentationPage;