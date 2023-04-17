import React, {createContext} from 'react';
import styled from 'styled-components';

import {formatName, useSectionData} from 'src/hooks';
import PaginatedTable from 'src/components/backstage/widgets/paginated_table/paginated_table';
import {Section} from 'src/types/organization';
import Loading from 'src/components/commons/loading';

export const SectionUrlContext = createContext('');

type Props = {
    section: Section;
};

const SectionList = ({section}: Props) => {
    const {id, internal, name, url} = section;
    const data = useSectionData(section);

    return (
        <Body>
            <SectionUrlContext.Provider value={url}>
                {data ?
                    <PaginatedTable
                        id={formatName(name)}
                        internal={internal}
                        isSection={true}
                        name={name}
                        data={data}
                        parentId={id}
                        pointer={true}
                    /> : <Loading/>}
            </SectionUrlContext.Provider>
        </Body>
    );
};

const Body = styled.div`
    display: flex;
    flex-direction: column;
`;

export default SectionList;