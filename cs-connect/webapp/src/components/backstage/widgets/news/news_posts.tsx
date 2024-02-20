import React, {
    Dispatch,
    FC,
    SetStateAction,
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
import {HyperlinkPathContext} from 'src/components/rhs/rhs_shared';
import SocialMediaPost, {PostOptions} from 'src/components/backstage/widgets/social_media_posts/social_media_post';
import {NewsQuery} from 'src/types/news';

const POSTS_PER_PAGE = 3;

type Props = {
    data: Post[];
    name: string;
    parentId: string;
    sectionId: string;
    perPage?: number;
    total: number;
    postOptions?: PostOptions;
    setQuery: Dispatch<SetStateAction<NewsQuery>>;
};

const NewsPosts: FC<Props> = ({
    data,
    name,
    parentId,
    sectionId,
    perPage = POSTS_PER_PAGE,
    total,
    postOptions,
    setQuery,
}) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const urlHash = useUrlHash();
    const {hash} = useLocation();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const hyperlinkPathContext = useContext(HyperlinkPathContext);
    const hyperlinkPath = `${hyperlinkPathContext}.${name}`;

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;

    const updatePage = (page: number) => {
        // perPage is needed because offset moves not by page by post
        // so if page is 2 and perPage is 3, offset should be 6 to move to the next page
        // becase the first 6 posts are already shown in the previous two pages
        setQuery((prev) => ({...prev, offset: `${(page - 1) * perPage}`}));
        setCurrentPage(page);
    };

    useEffect(() => {
        // At a certain point this could become #np-
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
        const current = Math.ceil((index + 1) / perPage);
        updatePage(current);
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
                    onChange: (page) => updatePage(page),
                    pageSize: perPage,
                    total,
                    showSizeChanger: false,
                }}
                dataSource={data}
                renderItem={(item: any) => (
                    <SocialMediaPost
                        post={item}
                        parentId={parentId}
                        sectionId={sectionId}
                        viewOnExternalSiteText='View on External Site'
                        hyperlinkPath={hyperlinkPath}
                        options={postOptions}
                    />
                )}
            />
        </Container>
    );
};

const Container = styled.div`
    width: 95%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default NewsPosts;
