import React, {useContext} from 'react';
import {FormattedMessage} from 'react-intl';

import {useSection, useSectionInfo} from 'src/hooks';
import {FullUrlContext, SectionContext} from 'src/components/rhs/rhs';
import RhsSectionsWidgetsContainer from 'src/components/rhs/rhs_sections_widgets_container';
import {getSiteUrl} from 'src/clients';
import {AccordionData} from 'src/types/accordion';

type Props = {
    element: AccordionData;
};

const EcosystemAccordionChild = ({element}: Props) => {
    const section = useSection(element.parentId);
    const sectionInfo = useSectionInfo(element.id, section?.url);
    const fullUrl = useContext(FullUrlContext);

    return (
        <>
            {(section && sectionInfo) ?
                <SectionContext.Provider value={{parentId: element.parentId, sectionId: element.id}}>
                    <RhsSectionsWidgetsContainer
                        headerPath={`${getSiteUrl()}${fullUrl}#_${sectionInfo.id}`}
                        sectionInfo={sectionInfo}
                        url={fullUrl}
                        widgets={section?.widgets}
                    />
                </SectionContext.Provider> : <FormattedMessage defaultMessage='The channel is not related to any section.'/>}
        </>
    );
};

export default EcosystemAccordionChild;
