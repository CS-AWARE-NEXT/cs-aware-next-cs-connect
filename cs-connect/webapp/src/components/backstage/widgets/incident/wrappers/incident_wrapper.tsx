import React, {useContext} from 'react';
import {useLocation, useRouteMatch} from 'react-router-dom';
import qs from 'qs';

import {SectionContext} from 'src/components/rhs/rhs';
import Incident from 'src/components/backstage/widgets/incident/incident';
import {Incident as IncidentType} from 'src/types/incident';
import {formatUrlWithId} from 'src/helpers';

type Props = {
    name?: string;
    url?: string;
};

const IncidentWrapper = ({
    name = '',
    url = '',
}: Props) => {
    const sectionContextOptions = useContext(SectionContext);
    const {params: {sectionId}} = useRouteMatch<{sectionId: string}>();
    const location = useLocation();
    const queryParams = qs.parse(location.search, {ignoreQueryPrefix: true});
    const parentIdParam = queryParams.parentId as string;

    const areSectionContextOptionsProvided = sectionContextOptions.parentId !== '' && sectionContextOptions.sectionId !== '';
    const parentId = areSectionContextOptionsProvided ? sectionContextOptions.parentId : parentIdParam;
    const sectionIdForUrl = areSectionContextOptionsProvided ? sectionContextOptions.sectionId : sectionId;

    const sectionUrl = formatUrlWithId(url, sectionIdForUrl);

    // TODO: replace this with actual data
    const data: IncidentType = {
        id: 24,
        reference_id: 'incident--bab6087c-904f-42ac-80c2-93594b8ac86a',
        organisation_id: '30',
        title: 'Potential DoS Attack 2024-11-11T16:25:46Z',
        description: 'Anomalous connection detected from source IP None to destination IP None over 6 protocol.',
        created_time: '2024-11-11T16:25:46.320616+00:00',
        detected_time: '2024-10-29T16:51:53.484845+00:00',
        modified_time: '2024-11-21T09:54:27.141297+00:00',
        notes: 'Anomalous connection detected from source IP None to destination IP None over 6 protocol.',
        status: 'open',
        attack_type: 'ddos',
        severity: null,
        system_graph_relations: ['unknown', 'unknown'],
        access_level: '1',
        bcdr_status: null,
        bcdr_relevant: true,
        last_modified_entity: [],
        anomalies: [
            {
                type: 'lineguard',
                id: 'c4cc5d9808789452ebc904a7070d466b873763fb72b1506c72d7d4965dbbc3fc',
                is_anomaly: false,
                description: 'Anomalous connection detected from source IP None to destination IP None over 6 protocol.',
                anomaly_category: 'Potential DoS Attack',
                timestamp: '2024-10-29T16:51:53.484878+00:00',
                attributes: {
                    critical_asset: {
                        type: null,
                        asset_identifier: 'unknown',
                    },
                    anomaly_details: {
                        detection_time: '2024-10-29T16:51:53.484890+00:00',
                        src_ip: null,
                        dest_ip: '192.168.33.137',
                        protocol: 'sctp',
                        raw_line: '{\'orig_h\': \'66.111.57.16\', \'orig_p\': 55736, \'resp_h\': \'172.31.66.46\', \'resp_p\': 80, \'proto\': 6, \'flow_bytes_toclient\': 40, \'flow_bytes_toserver\': 0, \'flow_pkts_toserver\': 1, \'flow_pkts_toclient\': 0, \'duration\': 0, \'line_number\': 1023995}',
                        file_path: 'test/suricata_NF-CSE-CIC-IDS2018.csv',
                        line_number: 1023995,
                    },
                },
            },
            {
                type: 'lineguard',
                id: 'd863db0e8eabec2a34cd43f935ef20b27a400f34638f401774869da92f427daa',
                is_anomaly: false,
                description: 'Anomalous connection detected from source IP None to destination IP None over 6 protocol.',
                anomaly_category: 'Potential DoS Attack',
                timestamp: '2024-10-29T16:51:53.484832+00:00',
                attributes: {
                    critical_asset: {
                        type: null,
                        asset_identifier: 'unknown',
                    },
                    anomaly_details: {
                        detection_time: '2024-10-29T16:51:53.484845+00:00',
                        src_ip: null,
                        dest_ip: '192.168.34.130',
                        protocol: 'sctp',
                        raw_line: '{\'orig_h\': \'172.31.66.46\', \'orig_p\': 49380, \'resp_h\': \'23.13.170.220\', \'resp_p\': 80, \'proto\': 6, \'flow_bytes_toclient\': 4159, \'flow_bytes_toserver\': 124391, \'flow_pkts_toserver\': 33, \'flow_pkts_toclient\': 100, \'duration\': 4178925, \'line_number\': 1022083}',
                        file_path: 'test/suricata_NF-CSE-CIC-IDS2018.csv',
                        line_number: 1022083,
                    },
                },
            },
        ],
    };

    return (
        <Incident
            data={data}
            name={name}
            sectionId={sectionIdForUrl}
            parentId={parentId}
            url={sectionUrl}
        />
    );
};

export default IncidentWrapper;