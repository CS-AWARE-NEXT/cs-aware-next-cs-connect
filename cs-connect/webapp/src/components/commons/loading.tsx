import React from 'react';
import {Spin} from 'antd';

import {LoadingIcon} from 'src/components/icons/icons';

const Loading = () => (
    <Spin
        indicator={LoadingIcon}
        tip='Loading...'
    />
);

export default Loading;
