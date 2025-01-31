import React, {FC} from 'react';
import {QuestionCircleOutlined} from '@ant-design/icons';
import {Tooltip} from 'antd';
import styled from 'styled-components';

import {HorizontalContainer} from 'src/components/backstage/widgets/news/news';

type Props = {
    label: string,
    infoText?: string,
    visible?: boolean,
};

const LabelWithInfoText: FC<Props> = ({
    label,
    infoText = '',
    visible = true,
}) => {
    if (!visible) {
        return null;
    }

    return (
        <HorizontalContainer>
            <InputLabel>{label}</InputLabel>
            <Tooltip
                title={infoText}
            >
                <QuestionCircleOutlined
                    style={{marginTop: '10px', marginLeft: '4px'}}
                />
            </Tooltip>
        </HorizontalContainer>
    );
};

export const InputLabel = styled.h5``;
export const Label = styled.h4`
    margin-bottom: 12px;
    margin-top: 20px;
`;

export default LabelWithInfoText;