import React from 'react';

import SectionsWidgetsContainer from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {Section, SectionInfo, Widget} from 'src/types/organization';
import {useToaster} from 'src/components/backstage/toast_banner';

type Props = {
    headerPath: string;
    sectionInfo: SectionInfo;
    section: Section;
    url: string;
    widgets: Widget[];
};

const RhsSectionsWidgetsContainer = (props: Props) => {
    const {sectionInfo, section, ...restProps} = props;
    const {add: addToast} = useToaster();

    let enableActions = false;
    if (section && section.internal) {
        enableActions = true;
    }

    const onExport = async () => {
        if (sectionInfo && section) {
            console.log('Exporting section', sectionInfo.id, section.url);
            addToast({content: 'Work in Progress!'});
        }
    };

    return (
        <SectionsWidgetsContainer
            {...restProps}
            sectionInfo={sectionInfo}
            isRhs={true}
            onExport={enableActions ? onExport : undefined}
            actionProps={enableActions ? {url: section.url} : undefined}
        />
    );
};

export default RhsSectionsWidgetsContainer;
