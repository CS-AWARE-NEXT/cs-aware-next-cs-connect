import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';
import {Avatar} from 'antd';
import {TagsOutlined} from '@ant-design/icons';

import {formatStringToCapitalize} from 'src/helpers';
import {SectionContext} from 'src/components/rhs/rhs';
import ItemsList from 'src/components/backstage/widgets/list/list';
import {Attachment} from 'src/types/scenario_wizard';
import {ecosystemAttachmentsWidget} from 'src/constants';

type Props = {
    name?: string;
    attachments: Attachment[]
};

const EcosystemAttachmentsWrapper = ({
    name = formatStringToCapitalize(ecosystemAttachmentsWidget),
    attachments = [],
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const location = useLocation();
    const queryParams = qs.parse(location.search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    const items = attachments ? attachments.map(({id, attachment}) => ({
        id: id as string,
        text: attachment,
    })) : [];

    return (
        <ItemsList
            data={{items}}
            name={name}
            sectionId={sectionIdForUrl}
            parentId={parentId}
            Avatar={<Avatar icon={<TagsOutlined/>}/>}
        />
    );
};

export default EcosystemAttachmentsWrapper;