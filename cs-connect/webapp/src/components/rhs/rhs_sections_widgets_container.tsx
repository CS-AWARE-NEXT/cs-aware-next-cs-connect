import React from 'react';

import SectionsWidgetsContainer from 'src/components/backstage/sections_widgets/sections_widgets_container';
import {SectionInfo, Widget} from 'src/types/organization';

type Props = {
    headerPath: string;
    sectionInfo: SectionInfo;
    url: string;
    widgets: Widget[];
};

const RhsSectionsWidgetsContainer = (props: Props) => {
    return (
        <SectionsWidgetsContainer
            {...props}
            isRhs={true}
        />
    );
};

export default RhsSectionsWidgetsContainer;
