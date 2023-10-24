import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {SectionContext} from 'src/components/rhs/rhs';
import Chart from 'src/components/backstage/widgets/chart/chart';
import {ChartType} from 'src/components/backstage/widgets/widget_types';
import {useChartData} from 'src/hooks';
import {formatUrlWithId} from 'src/helpers';

type Props = {
    name?: string;
    url?: string;
    chartType?: ChartType;
    index?: number;
};

const ChartWrapper = ({
    name = '',
    url = '',
    chartType,
    index = 1,
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const location = useLocation();
    const queryParams = qs.parse(location.search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    const data = useChartData(formatUrlWithId(url, sectionIdForUrl), chartType);

    if (!chartType) {
        return null;
    }

    // Debug data useful to verify whether the widget displays correctly.
    // const data: ChartData = {
    //     chartType,
    //     lineData: [
    //         {
    //             label: 'Page A',
    //             uv: 4000,
    //             pv: 2400,
    //             xv: 2000,
    //         },
    //         {
    //             label: 'Page B',
    //             uv: 9000,
    //             pv: 1398,
    //             xv: 2000,
    //         },
    //         {
    //             label: 'Page C',
    //             uv: 2000,
    //             pv: 9800,
    //             xv: -2000,
    //         },
    //         {
    //             label: 'Page D',
    //             uv: 2780,
    //             pv: -3908,
    //             xv: 2000,
    //         },
    //         {
    //             label: 'Page E',
    //             uv: 1890,
    //             pv: 4800,
    //             xv: 2000,
    //         },
    //         {
    //             label: 'Page F',
    //             uv: 2390,
    //             pv: 3800,
    //             xv: 2000,
    //         },
    //         {
    //             label: 'Page G',
    //             uv: 3490,
    //             pv: 4300,
    //             xv: 2000,
    //         },
    //     ],
    //     lineColor: {
    //         uv: '#8884d8',
    //         pv: '#82ca9d',
    //         xv: '#890089',
    //     },
    // };

    return (
        <Chart
            name={name}
            data={data}
            chartType={chartType}
            parentId={parentId}
            sectionId={sectionIdForUrl}
            delay={index + 1}
        />
    );
};

export default ChartWrapper;
