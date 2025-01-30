import React, {FC} from 'react';
import {Input} from 'antd';

import {MarkdownEditWithID} from 'src/components/commons/markdown_edit';

const {TextArea} = Input;

type Props = {
    field: string,
    label: string,
    placeholder: string,
    editEnabled: boolean,
    selectionData: any,
    rows?: number,
    updateData: (newData: any) => void,
};

const MarkdownTextArea: FC<Props> = ({
    field,
    label,
    placeholder,
    editEnabled,
    selectionData,
    rows = 3,
    updateData,
}) => {
    return (
        <>
            {editEnabled ?
                <TextArea
                    placeholder={placeholder}
                    value={selectionData[field]}
                    disabled={!editEnabled}
                    rows={rows}

                    // [] is for Computed Property Names
                    onChange={(e) => {
                        updateData({[field]: e.target.value});
                    }}
                /> :
                <MarkdownEditWithID
                    id={label}
                    opaqueText={true}
                    textBoxProps={{
                        value: selectionData[field] || '',
                        placeholder,
                    }}
                />
            }
        </>
    );
};

export default MarkdownTextArea;