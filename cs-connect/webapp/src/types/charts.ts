import {ChartType} from 'src/components/backstage/widgets/widget_types';

export type ChartData = {
    chartType: ChartType.SimpleLine;
    lineData: SimpleLineChartData[];
    lineColor: LineColor;
} | {
    chartType: ChartType.NoChart;
};

export type SimpleLineChartData = {
    label: string;
    [key: string]: number | string;
};

export type LineColor = {
    [key: string]: string;
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
