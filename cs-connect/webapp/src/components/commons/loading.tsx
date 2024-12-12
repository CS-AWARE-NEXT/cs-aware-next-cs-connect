import React from 'react';
import {Spin} from 'antd';

import {LoadingIcon} from 'src/components/icons';

type SpinSize = 'small' | 'default' | 'large';

type Props = {
    marginTop?: string;
    size?: SpinSize;
};

const Loading = ({
    marginTop = '0px',
    size = 'large',
}: Props) => (
    <Spin
        style={{marginTop}}
        size={size}
        indicator={LoadingIcon}
        tip='Loading...'
    />
);

export default Loading;
