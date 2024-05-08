import React, {useContext, useEffect} from 'react';
import styled from 'styled-components';

import {ChartData, SimpleBarChartType, SimpleLineChartType} from 'src/types/charts';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {formatName} from 'src/helpers';
import {ChartType} from 'src/components/backstage/widgets/widget_types';

import {HyperlinkPathContext} from 'src/components/rhs/rhs_shared';

import SimpleLineChart from './charts/line/simple_line';
import SimpleBarChart from './charts/bar/simple_bar';

type Props = {
    name: string;
    data: ChartData;
    chartType: ChartType;
    parentId: string;
    sectionId: string;
    delay?: number;
};

const buildChartByType = (
    data: ChartData,
    chartType: ChartType,
    parentId: string,
    sectionId: string,
    delay: number,
    hyperlinkPath: string,
): JSX.Element => {
    switch (chartType) {
    case ChartType.SimpleLine: {
        const {lineData, lineColor, referenceLines} = data as SimpleLineChartType;
        return (
            <SimpleLineChart
                lineData={lineData}
                lineColor={lineColor}
                referenceLines={referenceLines}
                parentId={parentId}
                sectionId={sectionId}
                delay={delay}
                hyperlinkPath={hyperlinkPath}
            />);
    }
    case ChartType.SimpleBar: {
        const {barData, barColor} = data as SimpleBarChartType;
        return (
            <SimpleBarChart
                barData={barData}
                barColor={barColor}
                parentId={parentId}
                sectionId={sectionId}
                delay={delay}
                hyperlinkPath={hyperlinkPath}
            />);
    }
    case ChartType.NoChart:
    default:
        return <></>;
    }
};

const Chart = ({
    name = '',
    data,
    chartType,
    parentId,
    sectionId,
    delay = 1,
}: Props) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const isRhs = useContext(IsRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const hyperlinkPathContext = useContext(HyperlinkPathContext);
    const hyperlinkPath = `${hyperlinkPathContext}.${name}`;

    useEffect(() => {
        // make responsive container appear
        const responsiveContainers = document.getElementsByClassName('recharts-responsive-container') as HTMLCollectionOf<HTMLElement>;
        let absoluteTimeout: NodeJS.Timeout;
        if (isRhs) {
            absoluteTimeout = setTimeout(() => {
                for (let i = 0; i < responsiveContainers.length; i++) {
                    responsiveContainers[i].style.position = 'absolute';
                }
            }, 200);
        } else {
            for (let i = 0; i < responsiveContainers.length; i++) {
                responsiveContainers[i].style.position = 'absolute';
            }
        }
        const timeout = isRhs ? 300 : 200;
        const relativeTimeout = setTimeout(() => {
            for (let i = 0; i < responsiveContainers.length; i++) {
                responsiveContainers[i].style.position = 'relative';
            }
        }, timeout);

        return () => {
            if (absoluteTimeout) {
                clearTimeout(absoluteTimeout);
            }
            clearTimeout(relativeTimeout);
        };
    }, []);

    const id = `${formatName(name)}-${sectionId}-${parentId}-widget`;
    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={ecosystemQuery}
                    text={name}
                    title={name}
                />
            </Header>
            {data && buildChartByType(data, chartType, parentId, sectionId, delay, hyperlinkPath)}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

export default Chart;
