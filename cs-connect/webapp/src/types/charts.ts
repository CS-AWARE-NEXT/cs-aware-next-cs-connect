import {ChartType} from 'src/components/backstage/widgets/widget_types';

export type ChartData = SimpleLineChartType | SimpleBarChartType | NoChartType;

export type NoChartType = {
    chartType: ChartType.NoChart;
};

export type SimpleLineChartType = {
    chartType: ChartType.SimpleLine;
    lineData: SimpleLineChartData[];
    lineColor: LineColor;
    referenceLines: SimpleReferenceLine[];
};

export type SimpleLineChartData = {
    label: string;
    [key: string]: number | string;
};

export type LineColor = {
    [key: string]: string;
};

export type SimpleReferenceLine = {
    x: string;
    label: string;
    stroke: string;
    strokeWidth?: string | number | undefined;
};

export type LineDot = {
    x: number;
    y: number;
    label: string;
    value: number;
};

export const defaultDot: LineDot = {
    x: 0.0,
    y: 0.0,
    label: '',
    value: 0.0,
};

export const isDefaultDot = (dot: LineDot) => {
    const {x, y, label, value} = dot;
    return x === 0.0 && y === 0.0 && value === 0.0 && label === '';
};

export type SimpleBarChartType = {
    chartType: ChartType.SimpleBar;
    barData: SimpleBarChartData[];
    barColor: BarColor;
    referenceLines: SimpleReferenceLine[];
    dataSuffix?: string;
};

export type SimpleBarChartData = {
    label: string;
    [key: string]: number | string;
};

export type BarColor = {
    [key: string]: string;
};