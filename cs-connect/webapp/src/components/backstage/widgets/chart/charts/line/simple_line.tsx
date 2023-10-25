import React, {
    FC,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import {
    LineColor,
    LineDot,
    SimpleLineChartData,
    defaultDot,
    isDefaultDot,
} from 'src/types/charts';

import {formatStringToLowerCase} from 'src/helpers';
import {useOnScreen, useScrollIntoView, useUrlHash} from 'src/hooks';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';

import {
    ClickableDot,
    Dot,
    idStringify,
    valueStringify,
} from './dots';

type Props = {
    lineData: SimpleLineChartData[];
    lineColor: LineColor;
    parentId: string;
    sectionId: string;
    delay?: number;
};

const SimpleLineChart: FC<Props> = ({
    lineData,
    lineColor,
    parentId,
    sectionId,
    delay = 1,
}) => {
    const isRhs = useContext(IsRhsContext);

    const [data, setData] = useState(lineData || []);
    useEffect(() => {
        setData(lineData || []);
    }, [lineData]);

    const keys = data && data.length > 0 ? Object.keys(data[0]).filter((key) => formatStringToLowerCase(key) !== 'label') : [];

    const [selectedDot, setSelectedDot] = useState<LineDot>(defaultDot);
    const urlHash = useUrlHash();

    useEffect(() => {
        if (!urlHash.includes(idStringify(sectionId))) {
            return;
        }
        if (!urlHash.startsWith('#dot-')) {
            return;
        }
        const [label, value] = urlHash.substring(5).replaceAll('dot', '.').split('-');
        const valueFloat = parseFloat(value);
        if (Number.isNaN(valueFloat)) {
            return;
        }
        setSelectedDot((prev) => ({...prev, label, value: valueFloat}));
    }, [urlHash]);

    useScrollIntoView(isDefaultDot(selectedDot) ? '' : `#dot-${selectedDot.label}-${valueStringify(selectedDot.value)}-${idStringify(sectionId)}`);

    const ref = useRef<HTMLDivElement | null>(null);
    const isOnScreen = useOnScreen(ref, {threshold: 0.8});

    // isAnimationActive = false solves the problem of dots not appearing on first rendering
    // Another solution to keep the animation is to set the line key to Math.random()_key,
    // but this causes problem for subsequiental re-rendering for the hyperlinking mechanism
    // isRhs ? key : `${Math.random()}_${key}` is used to solve the problem of dots not appearing on first rendering in the dashboard
    // All of the above comments are solved but now the hyperlink does no work in the dashboard
    return (
        <div
            ref={ref}
            id={`chart-container-${idStringify(sectionId)}`}
            style={{
                width: '95%',
                maxWidth: '100%',
                height: '500px',
                margin: '0 auto',
            }}
        >
            {data && data.length > 0 &&
                <ResponsiveContainer
                    width='100%'
                    height='100%'
                    debounce={1} // Fixes the resize observer error
                >
                    <LineChart
                        id={'simple-line-chart'}
                        width={600}
                        height={300}
                        data={data}
                    >
                        <CartesianGrid strokeDasharray='3 3'/>
                        <XAxis dataKey='label'/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        {keys.map((key) => (
                            <Line
                                key={isRhs ? key : `${Math.random()}_${key}`}
                                type='monotone'
                                dataKey={key}
                                stroke={lineColor[key]}
                                fill={lineColor[key]}
                                isAnimationActive={false}
                                dot={
                                    <Dot
                                        originalColor={lineColor[key]}
                                        selectedDot={selectedDot}
                                        sectionId={sectionId}
                                        delay={delay}
                                        isOnScreen={isOnScreen}
                                    />}
                                activeDot={
                                    <ClickableDot
                                        originalColor={lineColor[key]}
                                        selectedDot={selectedDot}
                                        parentId={parentId}
                                        sectionId={sectionId}
                                    />}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>}
        </div>
    );
};

export default SimpleLineChart;
