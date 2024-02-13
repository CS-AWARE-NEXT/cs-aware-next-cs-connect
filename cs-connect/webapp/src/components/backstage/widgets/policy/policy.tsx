import React, {
    FC,
    useContext,
    useEffect,
    useState,
} from 'react';
import styled from 'styled-components';
import {FormattedMessage, useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {Tag} from 'antd';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery, usePostsForTeam} from 'src/hooks';
import {formatName} from 'src/helpers';
import {PolicyTemplate} from 'src/types/policy';
import {allPostsSelector, teamNameSelector} from 'src/selectors';
import MultiTextBox from 'src/components/backstage/widgets/text_box/multi_text_box';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';

import {generatePolicySectionMessages} from './policy_section';

const DESCRIPTION_ID_PREFIX = 'policy-';

type Props = {
    data: PolicyTemplate;
    name: string;
    parentId: string;
    sectionId: string;
    sectionUrl: string;
};

const purpose = 'What is this policy for?';
const elements = 'What are the targets of this policy?';
const need = 'Why is this policy important?';
const rolesAndResponsibilities = 'Who (IT personnel, management, users) does what (+ maintenance of the policy).';
const references = 'Which standards, laws, and other policies influence this policy.';
const tags = 'Meaningful tags for the policy.';

const Policy: FC<Props> = ({
    data,
    name = '',
    parentId,
    sectionId,
    sectionUrl,
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

    const [template, setTemplate] = useState<PolicyTemplate>(data);
    useEffect(() => {
        setTemplate(data);
    }, [data]);

    const tooltipText = formatMessage({defaultMessage: 'Right-click to Open Menu'});

    // Both selector and API call, see the if below for the reason
    // that uses https://developers.mattermost.com/integrate/reference/server/server-reference/#API.GetPostsForChannel
    // to get all posts for a channel and call it for each channel in the user's team
    // using https://developers.mattermost.com/integrate/reference/server/server-reference/#API.GetChannelsForTeamForUser
    // or https://developers.mattermost.com/integrate/reference/server/server-reference/#API.GetChannelsForTeamForUser
    // check also if you need to use https://developers.mattermost.com/integrate/reference/server/server-reference/#API.GetPostThread
    // to get posts that are replies to another post, you can use the post.ReplyCount field to check if a post has replies
    let allPosts = useSelector(allPostsSelector());
    const {posts} = usePostsForTeam({teamId});
    if (!isRhs) {
        // if it is not in RHS we must use server-side props because users won't have access to posts from channels they're not into
        // in RHS we can use Mattermost selector posts because we need interactivity and users need only the posts in the channel
        allPosts = posts;
    }
    const purposeMessages = generatePolicySectionMessages({
        template,
        setTemplate,
        sectionName: 'purpose',
        allPosts,
        team,
        isRhs,
        tooltipText,
        removeEndpoint: sectionUrl,
    });
    const elementsMessages = generatePolicySectionMessages({
        template,
        setTemplate,
        sectionName: 'elements',
        allPosts,
        team,
        isRhs,
        tooltipText,
        removeEndpoint: sectionUrl,
    });
    const needMessages = generatePolicySectionMessages({
        template,
        setTemplate,
        sectionName: 'need',
        allPosts,
        team,
        isRhs,
        tooltipText,
        removeEndpoint: sectionUrl,
    });
    const rolesMessages = generatePolicySectionMessages({
        template,
        setTemplate,
        sectionName: 'rolesAndResponsibilities',
        allPosts,
        team,
        isRhs,
        tooltipText,
        removeEndpoint: sectionUrl,
    });
    const referencesMessages = generatePolicySectionMessages({
        template,
        setTemplate,
        sectionName: 'references',
        allPosts,
        team,
        isRhs,
        tooltipText,
        removeEndpoint: sectionUrl,
    });
    const tagsMessages = generatePolicySectionMessages({
        template,
        setTemplate,
        sectionName: 'tags',
        allPosts,
        team,
        isRhs,
        tooltipText,
        removeEndpoint: sectionUrl,
    });

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

            {(template && template.exported === 'true') ?
                <Tag color='green'><FormattedMessage defaultMessage='Exported'/></Tag> :
                <Tag color='blue'><FormattedMessage defaultMessage='Ongoing'/></Tag>}

            {purposeMessages &&
                <MultiTextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Purpose'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={purposeMessages && purposeMessages.length > 0 ? purposeMessages :
                        [{text: formatMessage({defaultMessage: purpose})}]}
                />}

            {elementsMessages &&
                <MultiTextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Elements'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={elementsMessages && elementsMessages.length > 0 ? elementsMessages :
                        [{text: formatMessage({defaultMessage: elements})}]}
                />}

            {needMessages &&
                <MultiTextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Need'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={needMessages && needMessages.length > 0 ? needMessages :
                        [{text: formatMessage({defaultMessage: need})}]}
                />}

            {rolesMessages &&
                <MultiTextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Roles & Responsibilities'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={rolesMessages && rolesMessages.length > 0 ? rolesMessages :
                        [{text: formatMessage({defaultMessage: rolesAndResponsibilities})}]}
                />}

            {referencesMessages &&
                <MultiTextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'References'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={referencesMessages && referencesMessages.length > 0 ? referencesMessages :
                        [{text: formatMessage({defaultMessage: references})}]}
                />}

            {tagsMessages &&
                <MultiTextBox
                    idPrefix={DESCRIPTION_ID_PREFIX}
                    name={formatMessage({defaultMessage: 'Tags'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={tagsMessages && tagsMessages.length > 0 ? tagsMessages :
                        [{text: formatMessage({defaultMessage: tags})}]}
                />}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default Policy;