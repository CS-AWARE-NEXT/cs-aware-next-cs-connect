import React, {FC} from 'react';
import {InputNumber as AntdInputNumber} from 'antd';

type Props = {
    field: string,
    min?: number,
    max?: number,
    editEnabled: boolean,
    selectionData: any,
    visible?: boolean,
    updateData: (newData: any) => void,
};

const InputNumber: FC<Props> = ({
    field,
    min = 0,
    max = 100,
    editEnabled,
    selectionData,
    visible = true,
    updateData,
}) => {
    if (!visible) {
        return null;
    }

    return (
        <AntdInputNumber
            min={min}
            max={max}
            defaultValue={min}
            value={selectionData[field] || min}
            onChange={(value) => {
                updateData({[field]: value || min});
            }}
            disabled={!editEnabled}
        />
    );
};

export default InputNumber;