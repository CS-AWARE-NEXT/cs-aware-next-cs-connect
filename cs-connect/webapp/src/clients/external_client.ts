import {Client4} from 'mattermost-redux/client';
import {ClientError} from '@mattermost/client';

import {GraphData} from 'src/types/graph';
import {PaginatedTableData} from 'src/types/paginated_table';
import {SectionInfo, SectionInfoParams} from 'src/types/organization';
import {TableData} from 'src/types/table';
import {TextBoxData} from 'src/types/text_box';
import {LinkListData, LinkListItem, ListData} from 'src/types/list';
import {TimelineData} from 'src/types/timeline';
import {PostData} from 'src/types/social_media';
import {ChartData} from 'src/types/charts';
import {ChartType} from 'src/components/backstage/widgets/widget_types';
import {ExerciseAssignment} from 'src/types/exercise';
import {EcosystemGraph} from 'src/types/ecosystem_graph';
import {ExportPolicyRequest, ExportPolicyResult, PolicyTemplate} from 'src/types/policy';
import {NewsPostData} from 'src/types/news';
import {BundleData} from 'src/types/bundles';
import {Incident} from 'src/types/incident';

// Is there really no existing list of consts for status codes?
const HTTP_STATUS_CODE_CONFLICT = 409;

export const updatePolicyTemplateField = async (params: ExportPolicyRequest, url: string): Promise<ExportPolicyResult> => {
    let data = await doPut<ExportPolicyResult>(
        url,
        JSON.stringify(params),
    );
    if (!data) {
        data = {} as ExportPolicyResult;
    }
    return data;
};

export const fetchPolicyTemplate = async (url: string): Promise<PolicyTemplate> => {
    let data = await doGet<PolicyTemplate>(url);
    if (!data) {
        data = {} as PolicyTemplate;
    }
    return data;
};

export const fetchBundle = async (url: string): Promise<BundleData> => {
    let data = await doGet<BundleData>(url);
    if (!data) {
        data = {} as BundleData;
    }
    return data;
};

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

export const deleteSectionInfo = async (id: string, url: string): Promise<void> => {
    await doDelete<void>(`${url}/${id}`);
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

export const saveLinkListItem = async (params: LinkListItem, url: string): Promise<void> => {
    await doPost<void>(
        url,
        JSON.stringify(params),
    );
};

export const deleteLinkListItem = async (id: string, url: string): Promise<void> => {
    const data = await doDelete(`${url}/${id}`);
    return data;
};

export const fetchLinkListData = async (url: string): Promise<LinkListData> => {
    let data = await doGet<LinkListData>(url);
    if (!data) {
        data = {items: []} as LinkListData;
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

export const fetchIncidentData = async (url: string): Promise<Incident> => {
    let data = await doGet<Incident>(url);
    if (!data) {
        data = {} as Incident;
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

export const fetchNewsPostData = async (url: string): Promise<NewsPostData> => {
    let data = await doGet<NewsPostData>(url);
    if (!data) {
        data = {} as NewsPostData;
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

export const fetchEcosystemGraphData = async (url: string): Promise<EcosystemGraph> => {
    let data = await doGet<EcosystemGraph>(url);
    if (!data) {
        data = {} as EcosystemGraph;
    }
    return data;
};

export const exportChannelToDatalake = async (
    url: string,
    channel: any,
): Promise<any> => {
    const body = JSON.stringify(channel);
    const data = await doPut(`${url}/channels/export`, body);
    return data;
};

export const exportEcosystemGraph = async (url: string): Promise<any> => {
    const data = await doPut(url, {});
    return data;
};

/**
 * Refresh the lock required to edit the ecosystem graph.
 *
 * @param url Base url for ecosystem graphs (see buildEcosystemGraphUrl).
 * @param userID The owner of the lock (for example, the Mattermost user ID).
 * @param lockDelay Time in minutes to keep the resource locked for. Cannot exceed a const defined on the data provider (currently set to 30 minutes).
 * @param mappedData Data to use to update the ecosystem graph if it can be successfully locked.
 * @returns true if the lock has been successfully acquired, false otherwise.
 */
export const refreshEcosystemGraphLock = async (url: string, userID: string, lockDelay: number, mappedData?: EcosystemGraph): Promise<boolean> => {
    try {
        await doPost<string>(`${url}/lock`, mappedData ? JSON.stringify({userID, lockDelay, ...mappedData}) : JSON.stringify({userID, lockDelay}));
    } catch (e: unknown) {
        if (e instanceof ClientError) {
            if (e.status_code === HTTP_STATUS_CODE_CONFLICT) {
                return false;
            }
        } else {
            throw e;
        }
    }
    return true;
};

/**
 * Drop a resource lock owned by some user.
 * @param url Base url for ecosystem graphs (see buildEcosystemGraphUrl).
 * @param userID The owner of the lock (for example, the Mattermost user ID).
 * @returns An error message if something went wrong, undefined on success.
 */
export const dropEcosystemGraphLock = async (url: string, userID: string): Promise<string|undefined> => {
    return doPost<string>(`${url}/drop_lock`, JSON.stringify({userID}));
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
