import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';
import {Avatar} from 'antd';
import {UnorderedListOutlined} from '@ant-design/icons';

import {formatStringToCapitalize} from 'src/helpers';
import {SectionContext} from 'src/components/rhs/rhs';
import ItemsList from 'src/components/backstage/widgets/list/list';
import {Outcome} from 'src/types/scenario_wizard';
import {ecosystemOutcomesWidget} from 'src/constants';

type Props = {
    name?: string;
    outcomes: Outcome[]
};

const EcosystemOutcomesWrapper = ({
    name = formatStringToCapitalize(ecosystemOutcomesWidget),
    outcomes = [],
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const location = useLocation();
    const queryParams = qs.parse(location.search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    const items = outcomes ? outcomes.map(({id, outcome}) => ({
        id: id as string,
        text: outcome,
    })) : [];

    return (
        <ItemsList
            data={{items}}
            name={name}
            sectionId={sectionIdForUrl}
            parentId={parentId}
            Avatar={<Avatar icon={<UnorderedListOutlined/>}/>}
        />
    );
};

export default EcosystemOutcomesWrapper;