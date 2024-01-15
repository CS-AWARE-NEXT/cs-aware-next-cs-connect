import React, {FC, useContext} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {formatName} from 'src/helpers';
import {PolicyTemplate} from 'src/types/policy';
import {postSelector, teamNameSelector} from 'src/selectors';
import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {navigateToUrl} from 'src/browser_routing';
import MultiTextBox from 'src/components/backstage/widgets/text_box/multi_text_box';

const DESCRIPTION_ID_PREFIX = 'policy-';

type Props = {
    data: PolicyTemplate;
    name: string;
    parentId: string;
    sectionId: string;
};

const navigateToPost = async (teamName: string, postId: string) => {
    navigateToUrl(`/${teamName}/pl/${postId}`);
};

const News: FC<Props> = ({
    data,
    name = '',
    parentId,
    sectionId,
}) => {
    const {formatMessage} = useIntl();

    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const isRhs = useContext(IsRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    const teamId = useSelector(getCurrentTeamId);
    let team = useSelector(teamNameSelector(teamId));
    if (!teamId) {
        team = {...team, display_name: 'All Teams', description: 'No team is selected'};
    }

    // TODO: Maybe here we need to perform an internal server to code to use Mattermost server SDK
    const testIds = ['bap9x5zdftfspf1kphoizgagdr', 'pytxoazhzjrptf5gc8pdpwbuby'];
    const tests = testIds ? testIds.map((p) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const post = useSelector(postSelector(p));
        console.log({post}, post?.message);
        return post?.message;
    }) : ['Purpose is still being defined'];

    const purpose = useSelector(postSelector(data.purpose));
    const elements = useSelector(postSelector(data.elements));

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={isEcosystemRhs ? '' : ecosystemQuery}
                    text={name}
                    title={name}
                />
            </Header>

            {tests &&
                <MultiTextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={'Tests'}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={tests}
                />}

            <TextBox
                idPrefix={DESCRIPTION_ID_PREFIX}
                name={'Purpose'}
                sectionId={sectionId}
                parentId={parentId}
                text={purpose ? purpose.message : 'Purpose is still being defined'}
            />
            <TextBox
                idPrefix={DESCRIPTION_ID_PREFIX}
                name={'Elements'}
                sectionId={sectionId}
                parentId={parentId}
                text={elements ? elements.message : 'Elements are still being defined'}
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

export default News;