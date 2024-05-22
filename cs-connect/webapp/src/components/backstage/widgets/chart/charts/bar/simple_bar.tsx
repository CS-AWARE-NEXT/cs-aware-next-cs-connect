import React, {
    FC,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    Bar,
    BarChart,
    Brush,
    CartesianGrid,
    Cell,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {useIntl} from 'react-intl';
import {useRouteMatch} from 'react-router-dom';

import {BarColor, SimpleBarChartData, SimpleReferenceLine} from 'src/types/charts';
import {formatStringToLowerCase, formatUrlAsMarkdown} from 'src/helpers';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {idStringify} from 'src/components/backstage/widgets/chart/charts/line/dots';
import {copyToClipboard} from 'src/utils';
import {useToaster} from 'src/components/backstage/toast_banner';
import {
    buildQuery,
    buildTo,
    buildToForCopy,
    isReferencedByUrlHash,
    useUrlHash,
} from 'src/hooks';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {FullUrlContext} from 'src/components/rhs/rhs';

type Props = {
    barData: SimpleBarChartData[];
    barColor: BarColor;
    dataSuffix?: string;
    referenceLines?: SimpleReferenceLine[];
    parentId: string;
    sectionId: string;
    delay?: number;
    hyperlinkPath: string;
};

export const CELL_PREFIX = 'cell-';

const SimpleBarChart: FC<Props> = ({
    barData,
    barColor,
    dataSuffix = '',
    referenceLines = [],
    parentId,
    sectionId,
    delay = 1,
    hyperlinkPath,
}) => {
    const isRhs = useContext(IsRhsContext);
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const urlHash = useUrlHash();
    const {url} = useRouteMatch();
    const {formatMessage} = useIntl();
    const {add: addToast} = useToaster();

    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);

    const [data, setData] = useState(barData || []);
    useEffect(() => {
        setData(barData || []);
    }, [barData]);

    const keys = data && data.length > 0 ? Object.keys(data[0]).filter((key) => formatStringToLowerCase(key) !== 'label') : [];

    // useEffect(() => {
    //     if (!urlHash.includes(idStringify(sectionId))) {
    //         return;
    //     }
    //     if (!urlHash.startsWith('#dot-')) {
    //         return;
    //     }
    //     const [label, value] = urlHash.substring(5).replaceAll('dot', '.').split('-');
    //     const valueFloat = parseFloat(value);
    //     if (Number.isNaN(valueFloat)) {
    //         return;
    //     }
    //     setSelectedDot((prev) => ({...prev, label, value: valueFloat}));
    // }, [urlHash]);

    // useScrollIntoView(isDefaultDot(selectedDot) ? '' : `#dot-${selectedDot.label}-${valueStringify(selectedDot.value)}-${idStringify(sectionId)}`);

    // const onClick = (bar: any, index: number) => {
    //     console.log('BAR ->', 'data', bar, 'index', index);
    // };

    const handleCellClick = (bar: any, cellId: string) => {
        const name = `${bar.label}`;
        const path = buildToForCopy(buildTo(fullUrl, cellId, ecosystemQuery, url));
        copyToClipboard(formatUrlAsMarkdown(path, `${hyperlinkPath}.${name}`));
        addToast({content: formatMessage({defaultMessage: 'Copied!'})});
    };

    const ref = useRef<HTMLDivElement | null>(null);

    return (
        <div
            ref={ref}
            id={`bar-chart-container-${idStringify(sectionId)}${dataSuffix}`}
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
                    <BarChart
                        id={'simple-bar-chart'}
                        width={500}
                        height={300}
                        data={data}
                    >
                        <CartesianGrid strokeDasharray='3 3'/>
                        <XAxis dataKey='label'/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend
                            verticalAlign='top'
                            wrapperStyle={{lineHeight: '40px'}}
                        />
                        <Brush
                            dataKey='label'
                            height={25}
                            stroke='#8884d8'
                        />
                        {(referenceLines && referenceLines.length > 0) && referenceLines.map((line) => (
                            <ReferenceLine
                                key={line.x}
                                x={line.x}
                                stroke={line.stroke}
                                strokeWidth={line.strokeWidth || 2}
                                label={{
                                    value: line.label,
                                    position: 'insideTop',
                                }}
                            />
                        ))}
                        {keys.map((key) => (
                            <Bar
                                key={isRhs ? key : `${Math.random()}_${key}`}
                                type='monotone'
                                dataKey={key}
                                stroke={barColor[key]}
                                fill={barColor[key]}
                                isAnimationActive={false}

                                // label={{
                                //     position: 'bottom',
                                //     angle: 90,
                                //     style: {
                                //         fontSize: 2
                                //     },
                                // }}
                                // onClick={onClick}
                                // activeBar={
                                //     <Rectangle
                                //         fill='pink'
                                //         stroke='blue'
                                //     />}
                            >
                                {data.map((entry, index) => {
                                    const cellId = `${CELL_PREFIX}${index}-${idStringify(sectionId)}${dataSuffix}`;
                                    return (
                                        <Cell
                                            id={cellId}
                                            key={cellId}
                                            cursor='pointer'
                                            stroke={isReferencedByUrlHash(urlHash, cellId) ? '#F4B400' : barColor[key]}
                                            strokeWidth={isReferencedByUrlHash(urlHash, cellId) ? 2 : 1}
                                            fill={barColor[key]}
                                            onClick={() => handleCellClick(entry, cellId)}
                                        />
                                    );
                                })}
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>}
        </div>
    );
};

export default SimpleBarChart;
