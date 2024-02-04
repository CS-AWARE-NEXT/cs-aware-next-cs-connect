import {Client4} from 'mattermost-redux/client';
import {ClientError} from '@mattermost/client';

import {GraphData} from 'src/types/graph';
import {PaginatedTableData} from 'src/types/paginated_table';
import {SectionInfo, SectionInfoParams} from 'src/types/organization';
import {TableData} from 'src/types/table';
import {TextBoxData} from 'src/types/text_box';
import {ListData} from 'src/types/list';
import {TimelineData} from 'src/types/timeline';
import {PostData} from 'src/types/social_media';
import {ChartData} from 'src/types/charts';
import {ChartType} from 'src/components/backstage/widgets/widget_types';
import {ExerciseAssignment} from 'src/types/exercise';

export const getSectionInfoUrl = (id: string, url: string): string => {
    return `${url}/${id}`;
};

export const fetchSectionInfo = async (id: string, url: string): Promise<SectionInfo> => {
    let data = await doGet<SectionInfo>(getSectionInfoUrl(id, url));
    if (!data) {
        data = {id: '', name: ''} as SectionInfo;
    }
    return data;
};

export const saveSectionInfo = async (params: SectionInfoParams, url: string): Promise<SectionInfo> => {
    let data = await doPost<SectionInfo>(
        url,
        JSON.stringify(params),
    );
    if (!data) {
        data = {id: '', name: ''} as SectionInfo;
    }
    return data;
};

export const updateSectionInfo = async (params: SectionInfoParams, url: string): Promise<SectionInfo> => {
    let data = await doPost<SectionInfo>(
        url,
        JSON.stringify(params),
    );
    if (!data) {
        data = {id: '', name: ''} as SectionInfo;
    }
    return data;
};

export const fetchGraphData = async (url: string): Promise<GraphData> => {
    let data = await doGet<GraphData>(url);
    if (!data) {
        data = {edges: [], nodes: []} as GraphData;
    }
    return data;
};

export const fetchTableData = async (url: string): Promise<TableData> => {
    let data = await doGet<TableData>(url);
    if (!data) {
        data = {caption: '', headers: [], rows: []} as TableData;
    }
    return data;
};

export const fetchPaginatedTableData = async (url: string): Promise<PaginatedTableData> => {
    let data = await doGet<PaginatedTableData>(url);
    if (!data) {
        data = {columns: [], rows: []} as PaginatedTableData;
    }
    return data;
};

export const fetchTextBoxData = async (url: string): Promise<TextBoxData> => {
    let data = await doGet<TextBoxData>(url);
    if (!data) {
        data = {text: ''} as TextBoxData;
    }
    return data;
};

export const fetchListData = async (url: string): Promise<ListData> => {
    let data = await doGet<ListData>(url);
    if (!data) {
        data = {items: []} as ListData;
    }
    return data;
};

export const fetchTimelineData = async (url: string): Promise<TimelineData> => {
    let data = await doGet<TimelineData>(url);
    if (!data) {
        data = {items: []} as TimelineData;
    }
    return data;
};

export const fetchPlaybookData = async (url: string): Promise<any> => {
    let data = await doGet<any>(url);
    if (!data) {
        data = {} as any;
    }
    return data;
};

export const fetchPostData = async (url: string): Promise<PostData> => {
    let data = await doGet<PostData>(url);
    if (!data) {
        data = {} as PostData;
    }
    return data;
};

export const fetchChartData = async (url: string, chartType: ChartType | undefined): Promise<ChartData> => {
    const defaultChartData: ChartData = {chartType: ChartType.NoChart};
    if (!chartType) {
        return defaultChartData;
    }
    let data = await doGet<ChartData>(url);
    if (!data) {
        data = defaultChartData;
    }
    return data;
};

export const fetchExerciseData = async (url: string): Promise<ExerciseAssignment> => {
    let data = await doGet<ExerciseAssignment>(url);
    if (!data) {
        data = {} as ExerciseAssignment;
    }
    return data;
};

export const deleteIssue = async (id: string, url: string): Promise<null> => {
    const data = await doDelete(`${url}/${id}`);
    return data;
};

const doGet = async <TData = any>(url: string): Promise<TData | undefined> => {
    const {data} = await doFetchWithResponse<TData>(url, {method: 'get'});
    return data;
};

const doPost = async <TData = any>(url: string, body = {}): Promise<TData | undefined> => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'POST',
        body,
    });
    return data;
};

const doDelete = async <TData = any>(url: string, body = {}): Promise<TData | undefined> => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'DELETE',
        body,
    });
    return data;
};

const doPut = async <TData = any>(url: string, body = {}): Promise<TData | undefined> => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'PUT',
        body,
    });
    return data;
};

const doPatch = async <TData = any>(url: string, body = {}): Promise<TData | undefined> => {
    const {data} = await doFetchWithResponse<TData>(url, {
        method: 'PATCH',
        body,
    });
    return data;
};

const doFetchWithResponse = async <TData = any>(
    url: string,
    options = {},
): Promise<{
    response: Response;
    data: TData | undefined;
}> => {
    const response = await fetch(url, options);
    let data;
    if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType === 'application/json') {
            data = await response.json() as TData;
        }
        return {
            response,
            data,
        };
    }

    data = await response.text();

    throw new ClientError(Client4.url, {
        message: data || '',
        status_code: response.status,
        url,
    });
};
