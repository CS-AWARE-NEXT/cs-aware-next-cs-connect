import React from 'react';
import styled from 'styled-components';
import {Empty} from 'antd';

import {Section} from 'src/types/organization';
import EcosystemGraphWrapper from 'src/components/backstage/widgets/graph/wrappers/ecosystem_graph_wrapper';
import {buildEcosystemGraphUrl} from 'src/hooks';
import {getSystemConfig} from 'src/config/config';
import CustomViewLinkListWrapper from 'src/components/backstage/widgets/link_list/wrappers/custom_view_link_list_wrapper';

type Props = {
    section: Section;
    customView: string;
};

/**
 * Build a custom view, which is different than the basic paginated table used normally.
 * @param param0 An object containing the section and the customView identifier (a string) to use.
 * @returns The section representation to embed, for example, in a backstage tab.
 */
const CustomSectionContent = ({section, customView}: Props) => {
    const ecosystemGraphUrl = buildEcosystemGraphUrl(section.url, false);
    const isEcosystemGraphEnabled = getSystemConfig().ecosystemGraph;

    if (customView === 'ecosystem-graph') {
        return (
            isEcosystemGraphEnabled ? (
                <StyledEcosystemGraphWrapper
                    editable={true}
                    url={ecosystemGraphUrl}
                />) : <Empty style={{marginTop: '20px'}}/>
        );
    }

    if (customView === 'participants-link-list') {
        return (
            <CustomViewLinkListWrapper
                name={'Channels'}
                url={section.url}
                sectionParentId={section.id}
            />
        );
    }

    return <></>;
};

const StyledEcosystemGraphWrapper = styled(EcosystemGraphWrapper)`
    margin-top: 20px;
    height: 70vh;
`;

export default CustomSectionContent;
