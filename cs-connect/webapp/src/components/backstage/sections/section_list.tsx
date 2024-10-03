import React, {createContext, useContext} from 'react';
import styled from 'styled-components';

import {OrganizationIdContext} from 'src/components/backstage/organizations/organization_details';
import {useNavHighlighting, useSectionData} from 'src/hooks';
import {formatName} from 'src/helpers';
import PaginatedTable from 'src/components/backstage/widgets/paginated_table/paginated_table';
import {Section} from 'src/types/organization';
import Loading from 'src/components/commons/loading';
import CustomViewLinkListWrapper from 'src/components/backstage//widgets/link_list/wrappers/custom_view_link_list_wrapper';

import {SECTION_NAV_ITEM, SECTION_NAV_ITEM_ACTIVE} from './sections';
import CustomSectionContent from './custom_section_content';

export const SectionUrlContext = createContext('');

type Props = {
    section: Section;
};

const SectionList = ({section}: Props) => {
    const organizationId = useContext(OrganizationIdContext);

    const {id, internal, customView, name, url} = section;

    const data = useSectionData(section);

    useNavHighlighting(SECTION_NAV_ITEM, SECTION_NAV_ITEM_ACTIVE, name, []);

    let content;
    if (customView) {
        content = (
            <CustomSectionContent
                section={section}
                customView={customView}
            />);
    } else if (data) {
        content = (
            <PaginatedTable
                id={formatName(name)}
                internal={internal}
                isSection={true}
                name={name}
                data={data}
                parentId={id}
                pointer={true}
            />
        );
    } else {
        content = (
            <Loading/>
        );
    }

    const isIssues = section && section.isIssues;
    const issuesAlertsUrl = `${section.url}/${organizationId}/${section.id}/links`;

    return (
        <Body>
            <SectionUrlContext.Provider value={url}>
                {isIssues && (
                    <CustomViewLinkListWrapper
                        name='Alerts'
                        url={issuesAlertsUrl}
                        sectionParentId={section.id}
                        singleLink={true}
                    />)}
                {content}
            </SectionUrlContext.Provider>
        </Body>
    );
};

const Body = styled.div`
    display: flex;
    flex-direction: column;
`;

export default SectionList;
