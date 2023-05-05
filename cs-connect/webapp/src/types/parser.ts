import {
    Object,
    Organization,
    Section,
    Widget,
} from './organization';

export type HyperlinkReference = {
    object?: Object;
    organization?: Organization;
    section?: Section;
    widget?: Widget;
    widgetHash?: string;
};
