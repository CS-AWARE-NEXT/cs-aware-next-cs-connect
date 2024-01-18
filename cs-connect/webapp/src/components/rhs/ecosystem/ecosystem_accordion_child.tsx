import React, {useContext} from 'react';
import {useIntl} from 'react-intl';
import {Alert} from 'antd';

import {useSection, useSectionInfo} from 'src/hooks';
import {FullUrlContext, SectionContext} from 'src/components/rhs/rhs';
import RhsSectionsWidgetsContainer from 'src/components/rhs/rhs_sections_widgets_container';
import {getSiteUrl} from 'src/clients';
import {AccordionData} from 'src/types/accordion';

type Props = {
    element: AccordionData;
};

const EcosystemAccordionChild = ({element}: Props) => {
    const {formatMessage} = useIntl();

    const section = useSection(element.parentId);
    const sectionInfo = useSectionInfo(element.id, section?.url);
    const fullUrl = useContext(FullUrlContext);

    return (
        <>
            {(section && sectionInfo) ? (
                <>
                    {(sectionInfo.id !== '' && sectionInfo.name !== '') ?
                        <SectionContext.Provider value={{parentId: element.parentId, sectionId: element.id}}>
                            <RhsSectionsWidgetsContainer
                                headerPath={`${getSiteUrl()}${fullUrl}#_${sectionInfo.id}`}
                                sectionInfo={sectionInfo}
                                section={section}
                                url={fullUrl}
                                widgets={section?.widgets}
                            />
                        </SectionContext.Provider> :
                        <Alert
                            message={formatMessage({defaultMessage: 'This section has been deleted!'})}
                            type='info'
                            style={{marginTop: '8px'}}
                        />}
                </>
            ) : (
                <Alert
                    message={formatMessage({defaultMessage: 'The channel is not related to any section.'})}
                    type='info'
                    style={{marginTop: '8px'}}
                />)}
        </>
    );
};

export default EcosystemAccordionChild;
