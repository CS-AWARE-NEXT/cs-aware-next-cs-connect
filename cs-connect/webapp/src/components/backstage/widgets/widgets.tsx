import React, {useContext} from 'react';

import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {Widget} from 'src/types/organization';

import ChannelsWrapper from './channels/wrappers/channels_wrapper';
import GraphWrapper from './graph/wrappers/graph_wrapper';
import ListWrapper from './list/wrappers/list_wrapper';
import PaginatedTableWrapper from './paginated_table/wrappers/paginated_table_wrapper';
import SingleChannelWrapper from './single_channel/wrappers/single_channel_wrapper';
import TableWrapper from './table/wrappers/table_wrapper';
import TextBoxWrapper from './text_box/wrappers/text_box_wrapper';
import TimelineWrapper from './timeline/wrappers/timeline_wrappers';
import CacaoPlaybookWrapper from './cacao_playbook/wrappers/playbook_wrapper';
import SocialMediaPostsWrapper from './social_media_posts/wrappers/social_media_posts_wrapper';
import ChartWrapper from './chart/wrappers/chart_wrapper';
import ExerciseWrapper from './exercise/wrappers/exercise_wrapper';
import {WidgetType} from './widget_types';

type Props = {
    widgets: Widget[];
};

const buildWidgetByType = (
    {name, type, url, chartType}: Widget,
    index: number,
): JSX.Element => {
    const key = `${name}-${type}-${index}`;
    const props = {key, name, url, chartType, index};

    switch (type) {
    case WidgetType.CacaoPlaybook:
        return <CacaoPlaybookWrapper {...props}/>;
    case WidgetType.Chart:
        return <ChartWrapper {...props}/>;
    case WidgetType.Graph:
        return <GraphWrapper {...props}/>;
    case WidgetType.Exercise:
        return <ExerciseWrapper {...props}/>;
    case WidgetType.PaginatedTable:
        return <PaginatedTableWrapper {...props}/>;
    case WidgetType.List:
        return <ListWrapper {...props}/>;
    case WidgetType.SocialMediaPosts:
        return <SocialMediaPostsWrapper {...props}/>;
    case WidgetType.Table:
        return <TableWrapper {...props}/>;
    case WidgetType.TextBox:
        return <TextBoxWrapper {...props}/>;
    case WidgetType.Timeline:
        return <TimelineWrapper {...props}/>;
    default:
        return <></>;
    }
};

const filterWidgetsByType = (widgets: Widget[], type: string): Widget[] => {
    if (!widgets) {
        return [];
    }
    return widgets.filter((widget) => widget.type === type);
};

const Widgets = ({widgets}: Props) => {
    const isRhs = useContext(IsRhsContext);
    const channelsWidgets = filterWidgetsByType(widgets, WidgetType.Channels);
    const singleChannelWidgets = filterWidgetsByType(widgets, WidgetType.SingleChannel);

    return (
        <>
            {widgets && widgets.map((widget, index) => buildWidgetByType(widget, index))}
            {channelsWidgets.length > 0 && !isRhs &&
                <ChannelsWrapper/>
            }
            {singleChannelWidgets.length > 0 && !isRhs &&
                <SingleChannelWrapper/>
            }
        </>
    );
};

export default Widgets;
