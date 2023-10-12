import React, {
    FC,
    useContext,
    useEffect,
    useState,
} from 'react';
import {useLocation} from 'react-router-dom';
import styled from 'styled-components';
import {List} from 'antd';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery, useUrlHash} from 'src/hooks';
import {formatName} from 'src/helpers';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {Post} from 'src/types/social_media';

import SocialMediaPost from './social_media_post';

const POSTS_PER_PAGE = 3;

type Props = {
    data: Post[];
    name: string;
    parentId: string;
    sectionId: string;
};

const SocialMediaPosts: FC<Props> = ({
    data,
    name,
    parentId,
    sectionId,
}) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const urlHash = useUrlHash();
    const {hash} = useLocation();
    const [currentPage, setCurrentPage] = useState<number>(1);

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;

    useEffect(() => {
        if (!urlHash || !urlHash.startsWith('#smp-')) {
            return;
        }
        if (!data) {
            // Fixes when sidebar is closed and posts are not loaded yet
            return;
        }
        const index = data.findIndex((post) => urlHash.includes(`-${post.id}-`));
        if (index < 0) {
            return;
        }
        const current = Math.ceil((index + 1) / POSTS_PER_PAGE);
        setCurrentPage(current);
    }, [urlHash, hash, data]);

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={isEcosystemRhs ? '' : buildQuery(parentId, sectionId)}
                    text={name}
                    title={name}
                />
            </Header>
            <List
                itemLayout='vertical'
                size='large'
                pagination={{
                    current: currentPage,
                    onChange: (page) => setCurrentPage(page),
                    pageSize: POSTS_PER_PAGE,
                }}
                dataSource={data}
                renderItem={(item: any) => (
                    <SocialMediaPost
                        post={item}
                        parentId={parentId}
                        sectionId={sectionId}
                    />
                )}
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

export default SocialMediaPosts;