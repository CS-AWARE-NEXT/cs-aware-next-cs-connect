import {debounce, isEqual} from 'lodash';
import {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {useHistory, useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getCurrentChannelId} from 'mattermost-webapp/packages/mattermost-redux/src/selectors/entities/common';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {useUpdateEffect} from 'react-use';

import {FetchChannelsParams, WidgetChannel, notFoundWidgetChannel} from 'src/types/channels';
import {
    FetchOrganizationsParams,
    Organization,
    Section,
    SectionInfo,
} from 'src/types/organization';
import {
    UserProps,
    fetchAllUsers,
    fetchChannelById,
    fetchChannels,
    fetchChartData,
    fetchEcosystemGraphData,
    fetchExerciseData,
    fetchGraphData,
    fetchListData,
    fetchPaginatedTableData,
    fetchPlaybookData,
    fetchPolicyTemplate,
    fetchPostData,
    fetchPostsByIds,
    fetchPostsForTeam,
    fetchSectionInfo,
    fetchTableData,
    fetchTextBoxData,
    fetchTimelineData,
    getUserProps,
    userAdded,
} from 'src/clients';
import {fillEdges, fillNodes, markNodesAndEdges} from 'src/components/backstage/widgets/graph/graph_node_type';
import {
    getEcosystem,
    getOrganizationById,
    getOrganizations,
    getOrganizationsNoEcosystem,
} from 'src/config/config';
import {GraphData, GraphSectionOptions} from 'src/types/graph';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {PaginatedTableData} from 'src/types/paginated_table';
import {TableData} from 'src/types/table';
import {TextBoxData} from 'src/types/text_box';
import {fillColumn, fillRow} from 'src/components/backstage/widgets/paginated_table/paginated_table';
import {navigateToUrl} from 'src/browser_routing';
import {resolve} from 'src/utils';
import {PARENT_ID_PARAM} from 'src/constants';
import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import {ListData} from 'src/types/list';
import {TimelineData} from 'src/types/timeline';
import {formatName, formatSectionPath} from 'src/helpers';
import {UserOption} from 'src/types/users';
import {PostData} from 'src/types/social_media';
import {ChartData} from 'src/types/charts';
import {ChartType} from 'src/components/backstage/widgets/widget_types';
import {ExerciseAssignment} from 'src/types/exercise';
import {EcosystemGraph} from 'src/types/ecosystem_graph';
import {PolicyTemplate} from 'src/types/policy';
import {
    GetPostsByIdsResult,
    GetPostsForTeamResult,
    PostsByIdsParams,
    PostsForTeamParams,
} from 'src/types/post';

type FetchParams = FetchOrganizationsParams;

export enum ReservedCategory {
    Documentation = 'Documentation',
    Ecosystem = 'Ecosystem',
    Organizations = 'Organizations',
}

export const useReservedCategoryTitleMapper = (): (categoryName: ReservedCategory | string) => string => {
    const {formatMessage} = useIntl();
    return (categoryName: ReservedCategory | string) => {
        switch (categoryName) {
        case ReservedCategory.Documentation:
            return formatMessage({defaultMessage: 'Documentation'});
        case ReservedCategory.Ecosystem:
            return formatMessage({defaultMessage: 'Ecosystem'});
        case ReservedCategory.Organizations:
            return formatMessage({defaultMessage: 'Organizations'});
        default:
            return categoryName;
        }
    };
};

export const useEcosystem = (): Organization => {
    return getEcosystem();
};

export const useOrganization = (id: string): Organization => {
    return getOrganizationById(id);
};

export const useIsSectionFromEcosystem = (sectionId: string): boolean => {
    const sections = getEcosystem()?.sections;
    if (!sections) {
        return false;
    }
    return sections.filter((section) => section.id === sectionId).length > 0;
};

export const useOrganizionsNoEcosystem = (): Organization[] => {
    return getOrganizationsNoEcosystem();
};

export const useOrganizationsNoPageList = (): Organization[] => {
    const [organizations, setOrganizations] = useState<Organization[]>(getOrganizations());
    const currentTeamId = useSelector(getCurrentTeamId);

    useEffect(() => {
        organizations.sort();
        setOrganizations(organizations);
    }, [currentTeamId]);

    return organizations;
};

export const useUserAdded = () => {
    const teamId = useSelector(getCurrentTeamId);
    const userId = useSelector(getCurrentUserId);
    const channelId = useSelector(getCurrentChannelId);

    useEffect(() => {
        let isCanceled = false;
        async function userAddedAsync() {
            userAdded({teamId, userId});
        }

        userAddedAsync();

        return () => {
            isCanceled = true;
        };
    }, [teamId, userId, channelId]);
};

export const useOrganizationsList = (defaultFetchParams: FetchOrganizationsParams, routed = true): [
    Organization[],
    number,
    FetchOrganizationsParams,
    React.Dispatch<React.SetStateAction<FetchOrganizationsParams>>,
] => {
    const [organizations, setOrganizations] = useState<Organization[]>(getOrganizationsNoEcosystem());
    const [totalCount, setTotalCount] = useState(0);
    const history = useHistory();
    const location = useLocation();
    const [fetchParams, setFetchParams] = useState(combineQueryParameters(defaultFetchParams, location.search));

    // const currentTeamId = useSelector(getCurrentTeamId);
    // check whether [fetchParams, currentTeamId] is a good set of dependencies
    useEffect(() => {
        organizations.sort();
        if (fetchParams.direction === 'desc') {
            organizations.reverse();
        }
        setOrganizations(organizations);
        setTotalCount(organizations.length);
    });

    useEffect(() => {
        let orgs = getOrganizationsNoEcosystem();
        orgs.sort();
        if (fetchParams.direction === 'desc') {
            orgs.reverse();
        }
        const searchTerm = fetchParams.search_term;
        if (searchTerm && searchTerm.trim().length !== 0) {
            orgs = orgs.filter((o) => o.name.indexOf(searchTerm) !== -1);
        }
        setOrganizations(orgs);
        setTotalCount(orgs.length);
    }, [fetchParams.search_term]);

    useUpdateFetchParams(routed, fetchParams, history, location);

    return [organizations, totalCount, fetchParams, setFetchParams];
};

export const useSection = (id: string): Section => {
    return getOrganizations().
        map((o) => o.sections).
        flat().
        filter((s: Section) => s.id === id)[0];
};

export const useSectionInfo = (id: string, url: string, refresh = false): SectionInfo => {
    const [info, setInfo] = useState<SectionInfo | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchSectionInfoAsync() {
            const infoResult = await fetchSectionInfo(id, url);
            if (!isCanceled) {
                setInfo(infoResult);
            }
        }

        fetchSectionInfoAsync();

        return () => {
            isCanceled = true;
        };
    }, [id, refresh]);
    return info as SectionInfo;
};

export const useSectionData = ({id, name, customView, url}: Section): PaginatedTableData => {
    const [sectionData, setSectionData] = useState<PaginatedTableData>({columns: [], rows: []});
    const {path, url: routeUrl} = useRouteMatch();
    const organizationId = useContext(OrganizationIdContext);
    const basePath = `${formatSectionPath(path, organizationId)}/${formatName(name)}`;

    useEffect(() => {
        let isCanceled = false;
        async function fetchSectionDataAsync() {
            const paginatedTableDataResult = await fetchPaginatedTableData(url);
            if (!isCanceled) {
                const {columns, rows} = sectionData;
                paginatedTableDataResult.columns.forEach(({title, sortable}) => {
                    columns.push(fillColumn(title, sortable));
                });
                paginatedTableDataResult.rows.forEach((row) => {
                    rows.push({
                        ...fillRow(row, '', routeUrl, ''),
                        onClick: () => navigateToUrl(`${basePath}/${row.id}?${PARENT_ID_PARAM}=${id}`),
                    });
                });
                setSectionData({columns, rows});
            }
        }

        // sections with custom views also need specialized custom data loading, so in such case the hook does nothing
        if (!customView) {
            fetchSectionDataAsync();
        }

        return () => {
            isCanceled = true;
        };
    }, [url]);

    return sectionData as PaginatedTableData;
};

export const useGraphData = (
    url: string,
    hash: string,
    options: GraphSectionOptions,
): GraphData => {
    const [graphData, setGraphData] = useState<GraphData | {}>({});
    const {hash: sectionUrlHash} = useLocation();

    useEffect(() => {
        let isCanceled = false;
        async function fetchGraphDataAsync() {
            const graphDataResult = await fetchGraphData(url);
            if (!isCanceled) {
                const filledNodes = fillNodes(graphDataResult.nodes, {...options, sectionUrlHash});
                const filledEdges = fillEdges(graphDataResult.edges);
                markNodesAndEdges(filledNodes, filledEdges, filledNodes.find((node) => node.data.isUrlHashed));
                setGraphData({
                    description: graphDataResult.description,
                    edges: filledEdges,
                    nodes: filledNodes,
                });
            }
        }

        fetchGraphDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url, hash]);
    return graphData as GraphData;
};

// Fetch ecosystem graph node and edges.
export const useEcosystemGraphData = (
    url: string,
): [EcosystemGraph | undefined, React.Dispatch<React.SetStateAction<EcosystemGraph | undefined>>] => {
    const [graphData, setGraphData] = useState<EcosystemGraph | undefined>(undefined);

    useEffect(() => {
        let isCanceled = false;
        async function fetchGraphDataAsync() {
            const graphDataResult = await fetchEcosystemGraphData(url);
            if (!isCanceled) {
                setGraphData(graphDataResult);
            }
        }

        fetchGraphDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url]);
    return [graphData, setGraphData];
};

export const useTableData = (url: string): TableData => {
    const [tableData, setTableData] = useState<TableData | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchTableDataAsync() {
            const tableDataResult = await fetchTableData(url);
            if (!isCanceled) {
                setTableData(tableDataResult);
            }
        }

        fetchTableDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url]);
    return tableData as TableData;
};

export const usePaginatedTableData = (url: string, query: string): PaginatedTableData => {
    const [paginatedTableData, setPaginatedTableData] = useState<PaginatedTableData>({columns: [], rows: []});
    const fullUrl = useContext(FullUrlContext);
    const {url: routeUrl} = useRouteMatch();

    useEffect(() => {
        let isCanceled = false;
        async function fetchPaginatedTableDataAsync() {
            const paginatedTableDataResult = await fetchPaginatedTableData(url);
            if (!isCanceled) {
                const {columns, rows} = paginatedTableData;
                paginatedTableDataResult.columns.forEach(({title, sortable}) => {
                    columns.push(fillColumn(title, sortable));
                });
                paginatedTableDataResult.rows.forEach((row) => {
                    rows.push(fillRow(row, fullUrl, routeUrl, query));
                });
                setPaginatedTableData({columns, rows});
            }
        }

        fetchPaginatedTableDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url]);

    return paginatedTableData as PaginatedTableData;
};

export const useTextBoxData = (url: string): TextBoxData => {
    const [textBoxData, setTextBoxData] = useState<TextBoxData | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchTextBoxDataAsync() {
            const textBoxDataResult = await fetchTextBoxData(url);
            if (!isCanceled) {
                setTextBoxData(textBoxDataResult);
            }
        }

        fetchTextBoxDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url]);
    return textBoxData as TextBoxData;
};

export const useListData = (url: string): ListData => {
    const [listData, setListData] = useState<ListData | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchListDataAsync() {
            const listDataResult = await fetchListData(url);
            if (!isCanceled) {
                setListData(listDataResult);
            }
        }

        fetchListDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url]);
    return listData as ListData;
};

export const useTimelineData = (url: string): TimelineData => {
    const [timelineData, setTimelineData] = useState<TimelineData | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchTimelineDataAsync() {
            const listDataResult = await fetchTimelineData(url);
            if (!isCanceled) {
                setTimelineData(listDataResult);
            }
        }

        fetchTimelineDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url]);
    return timelineData as TimelineData;
};

export const usePlaybookData = (url: string): any => {
    const [playbookData, setPlaybookData] = useState<any | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchPlaybookDataAsync() {
            const playbookDataResult = await fetchPlaybookData(url);
            if (!isCanceled) {
                setPlaybookData(playbookDataResult);
            }
        }

        fetchPlaybookDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url]);
    return playbookData as any;
};

export const usePostData = (url: string): PostData => {
    const [postData, setPostData] = useState<PostData | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchPostDataAsync() {
            const postDataResult = await fetchPostData(url);
            if (!isCanceled) {
                setPostData(postDataResult);
            }
        }

        fetchPostDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url]);
    return postData as PostData;
};

export const useChartData = (url: string, chartType: ChartType | undefined): ChartData => {
    const [chartData, setChartData] = useState<ChartData | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchChartDataAsync() {
            const chartDataResult = await fetchChartData(url, chartType);
            if (!isCanceled) {
                setChartData(chartDataResult);
            }
        }

        fetchChartDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url]);
    return chartData as ChartData;
};

export const useExerciseData = (url: string): ExerciseAssignment => {
    const [exerciseAssignment, setExerciseAssignment] = useState<ExerciseAssignment | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchExerciseDataAsync() {
            const exerciseAssignmentResult = await fetchExerciseData(url);
            if (!isCanceled) {
                setExerciseAssignment(exerciseAssignmentResult);
            }
        }

        fetchExerciseDataAsync();

        return () => {
            isCanceled = true;
        };
    }, [url]);

    return exerciseAssignment as ExerciseAssignment;
};

export const usePolicyTemplateData = (url: string, refresh = false): PolicyTemplate => {
    const [policyTemplate, setPolicyTemplate] = useState<PolicyTemplate | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchPolicyTemplateAsync() {
            const policyTemplateResult = await fetchPolicyTemplate(url);
            if (!isCanceled) {
                setPolicyTemplate(policyTemplateResult);
            }
        }

        fetchPolicyTemplateAsync();

        return () => {
            isCanceled = true;
        };
    }, [url, refresh]);

    return policyTemplate as PolicyTemplate;
};

export const usePostsByIds = (params: PostsByIdsParams): GetPostsByIdsResult => {
    const [postsByIds, setPostsByIds] = useState<GetPostsByIdsResult | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchPostsByIdsAsync() {
            const postsByIdsResult = await fetchPostsByIds(params);
            if (!isCanceled) {
                setPostsByIds(postsByIdsResult);
            }
        }

        fetchPostsByIdsAsync();

        return () => {
            isCanceled = true;
        };
    }, [params.postIds]);

    return postsByIds as GetPostsByIdsResult;
};

export const usePostsForTeam = (params: PostsForTeamParams): GetPostsForTeamResult => {
    const [postsForTeam, setPostsForTeam] = useState<GetPostsForTeamResult | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchPostsForTeamAsync() {
            const postsForTeamResult = await fetchPostsForTeam(params);
            if (!isCanceled) {
                setPostsForTeam(postsForTeamResult);
            }
        }

        fetchPostsForTeamAsync();

        return () => {
            isCanceled = true;
        };
    }, [params.teamId]);

    return postsForTeam as GetPostsForTeamResult;
};

export const useChannelsList = (defaultFetchParams: FetchChannelsParams): WidgetChannel[] => {
    const [channels, setChannels] = useState<WidgetChannel[]>([]);

    useEffect(() => {
        let isCanceled = false;
        async function fetchChannelsAsync() {
            const channelsReturn = await fetchChannels(defaultFetchParams);
            if (!isCanceled && channelsReturn.items) {
                setChannels(channelsReturn.items);
            }
        }

        fetchChannelsAsync();

        return () => {
            isCanceled = true;
        };
    }, []);

    return channels;
};

export const useChannelById = (channelId: string): WidgetChannel => {
    const [channel, setChannel] = useState<WidgetChannel | {}>({});

    useEffect(() => {
        let isCanceled = false;
        async function fetchChannelsAsync() {
            try {
                const channelReturn = await fetchChannelById(channelId);
                if (!isCanceled) {
                    setChannel(channelReturn.channel);
                }
            } catch (err: any) {
                setChannel(notFoundWidgetChannel);
            }
        }

        if (channelId) {
            fetchChannelsAsync();
        }

        return () => {
            isCanceled = true;
        };
    }, [channelId]);

    return channel as WidgetChannel;
};

export const useAllUsersOptions = (): UserOption[] => {
    const [users, setUsers] = useState<UserOption[]>([]);
    const teamId = useSelector(getCurrentTeamId);

    useEffect(() => {
        let isCanceled = false;
        async function fetchAllUsersAsync() {
            const result = await fetchAllUsers(teamId);
            if (!isCanceled) {
                // This may be useful in future if the user is is needed
                // value: user.userId,
                const userOptions = result.users.map((user) => ({
                    value: `${user.firstName} ${user.lastName} [${user.username}]`.trim(),
                    label: `${user.firstName} ${user.lastName} [${user.username}]`.trim(),
                }));
                setUsers(userOptions);
            }
        }

        fetchAllUsersAsync();

        return () => {
            isCanceled = true;
        };
    }, []);
    return users;
};

export const useUserProps = (): [UserProps, React.Dispatch<React.SetStateAction<UserProps>>] => {
    const userId = useSelector(getCurrentUserId);
    const [userProps, setUserProps] = useState<UserProps>();

    useEffect(() => {
        let isCanceled = false;
        async function fetchUserPropsAsync() {
            const result = await getUserProps({userId});
            if (!isCanceled) {
                setUserProps(result);
            }
        }

        fetchUserPropsAsync();

        return () => {
            isCanceled = true;
        };
    }, [userId]);

    return [userProps as UserProps, setUserProps as React.Dispatch<React.SetStateAction<UserProps>>];
};

// Update the query string when the fetchParams change
const useUpdateFetchParams = (
    routed: boolean,
    fetchParams: FetchParams,
    history: any,
    location: any,
): void => {
    useEffect(() => {
        if (routed) {
            const newFetchParams: Record<string, unknown> = {...fetchParams};
            delete newFetchParams.page;
            delete newFetchParams.per_page;
            history.replace({...location, search: qs.stringify(newFetchParams, {addQueryPrefix: false, arrayFormat: 'brackets'})});
        }
    }, [fetchParams, history]);
};

const combineQueryParameters = (
    oldParams: FetchOrganizationsParams,
    searchString: string,
): FetchOrganizationsParams => {
    const queryParams = qs.parse(searchString, {ignoreQueryPrefix: true});
    return {...oldParams, ...queryParams};
};

/**
 * For controlled props or other pieces of state that need immediate updates with a debounced side effect.
 * @remarks
 * This is a problem solving hook; it is not intended for general use unless it is specifically needed.
 * Also consider {@link https://github.com/streamich/react-use/blob/master/docs/useDebounce.md react-use#useDebounce}.
 *
 * @example
 * const [debouncedValue, setDebouncedValue] = useState('…');
 * const [val, setVal] = useProxyState(debouncedValue, setDebouncedValue, 500);
 * const input = <input type='text' value={val} onChange={({currentTarget}) => setVal(currentTarget.value)}/>;
 */
export const useProxyState = <T>(
    prop: T,
    onChange: (val: T) => void,
    wait = 500,
): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const check = useRef(prop);
    const [value, setValue] = useState(prop);

    useUpdateEffect(() => {
        if (!isEqual(value, check.current)) {
            // check failed; don't destroy pending changes (values set mid-cycle between send/sync)
            return;
        }
        check.current = prop; // sync check
        setValue(prop);
    }, [prop]);

    const onChangeDebounced = useMemo(() => debounce((v) => {
        check.current = v; // send check
        onChange(v);
    }, wait), [wait, onChange]);

    useEffect(() => onChangeDebounced.cancel, [onChangeDebounced]);

    return [value, useCallback((update) => {
        setValue((v) => {
            const newValue = resolve(update, v);
            onChangeDebounced(newValue);
            return newValue;
        });
    }, [setValue, onChangeDebounced])];
};
