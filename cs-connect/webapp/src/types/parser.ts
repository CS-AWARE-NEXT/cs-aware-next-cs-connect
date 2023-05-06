import {Object, Organization, Section} from './organization';

export type HyperlinkReference = {
    object?: Object;
    organization?: Organization;
    section?: Section;
    widgetHash?: WidgetHash;
};

export type WidgetHash = {
    hash: string;
    text: string;
};
