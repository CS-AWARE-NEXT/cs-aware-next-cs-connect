import {ReactNode} from 'react';

export interface TimelineData {
    items: TimelineItem[];
}

export interface TimelineItem {
    id: string;
    label: string;
    text: string;
}

export interface TimelineDataItem {
    color: string;
    label: ReactNode;
    children: ReactNode;
}