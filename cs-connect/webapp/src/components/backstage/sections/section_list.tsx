import React, {createContext} from 'react';
import styled from 'styled-components';

import {useNavHighlighting, useSectionData} from 'src/hooks';
import {formatName} from 'src/helpers';
import PaginatedTable from 'src/components/backstage/widgets/paginated_table/paginated_table';
import {Section} from 'src/types/organization';
import Loading from 'src/components/commons/loading';

import {SECTION_NAV_ITEM, SECTION_NAV_ITEM_ACTIVE} from './sections';
import CustomSectionContent from './custom_section_content';

export const SectionUrlContext = createContext('');

type Props = {
    section: Section;
};

const SectionList = ({section}: Props) => {
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

    return (
        <Body>
            <SectionUrlContext.Provider value={url}>
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
