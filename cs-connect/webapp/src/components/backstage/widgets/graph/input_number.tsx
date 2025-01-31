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
            value={selectionData[field]}
            onChange={(value) => {
                updateData({criticalityLevel: value || 0});
            }}
            disabled={!editEnabled}
        />
    );
};

export default InputNumber;