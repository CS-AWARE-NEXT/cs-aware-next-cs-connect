import React, {useState} from 'react';
import styled, {css} from 'styled-components';
import {useUpdateEffect} from 'react-use';
import {Dropdown, MenuProps, Tooltip} from 'antd';

import FormattedMarkdown from './formatted_markdown';
import ShowMore from './show_more';

export type MarkdownEditProps = {
    value: string;
    placeholder: string;
    className?: string;
    noBorder?: boolean;
    borderColor?: string;
    disabled?: boolean;
    previewDisabled?: boolean;
    opaqueText?: boolean;
    pointer?: boolean;

    tooltipText?: string;
    dropdownItems?: MenuProps['items'];
    dropdownTrigger?: ('click' | 'hover' | 'contextMenu')[];

    onClick?: () => void;
};

const MarkdownEdit = (props: MarkdownEditProps) => {
    const [value, setValue] = useState(props.value);

    useUpdateEffect(() => {
        setValue(props.value);
    }, [props.value]);

    // As of now editing is disabled because we are just presenting data to users
    const isEditing = false;

    return (
        <Tooltip
            placement='top'
            title={props.tooltipText || ''}
        >
            {(props.dropdownItems && props.dropdownItems.length > 0) ? (
                <Dropdown
                    menu={{items: props.dropdownItems}}
                    trigger={props.dropdownTrigger || ['contextMenu']}
                    placement='bottomRight'
                >
                    <MarkdownEditContainer
                        editing={isEditing}
                        dashed={value === ''}
                        noBorder={props.noBorder}
                        borderColor={props.borderColor}
                        pointer={props.pointer || false}
                        className={props.className}
                        opaqueText={props.opaqueText}
                    >
                        <RenderedText
                            data-testid='rendered-text'
                            onClick={props.onClick}
                            style={{cursor: props.pointer ? 'pointer' : 'text'}}
                            opaqueText={props.opaqueText}
                        >
                            {value ? (
                                <ShowMore>
                                    <FormattedMarkdown value={value}/>
                                </ShowMore>
                            ) : (
                                <PlaceholderText>
                                    <FormattedMarkdown value={props.placeholder}/>
                                </PlaceholderText>
                            )}
                        </RenderedText>
                    </MarkdownEditContainer>
                </Dropdown>
            ) : (
                <MarkdownEditContainer
                    editing={isEditing}
                    dashed={value === ''}
                    noBorder={props.noBorder}
                    borderColor={props.borderColor}
                    pointer={props.pointer || false}
                    className={props.className}
                    opaqueText={props.opaqueText}
                >
                    <RenderedText
                        data-testid='rendered-text'
                        onClick={props.onClick}
                        style={{cursor: props.pointer ? 'pointer' : 'text'}}
                        opaqueText={props.opaqueText}
                    >
                        {value ? (
                            <ShowMore>
                                <FormattedMarkdown value={value}/>
                            </ShowMore>
                        ) : (
                            <PlaceholderText>
                                <FormattedMarkdown value={props.placeholder}/>
                            </PlaceholderText>
                        )}
                    </RenderedText>
                </MarkdownEditContainer>
            )}
        </Tooltip>
    );
};

const HoverMenuContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0px 8px;
    position: absolute;
    height: 32px;
    right: 2px;
    top: 8px;
    z-index: 1;
`;

const commonTextStyle = css<{
    opaqueText?: boolean
}>`
    display: block;
    align-items: center;
    border-radius: var(--markdown-textbox-radius, 4px);
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
    padding: var(--markdown-textbox-padding, 12px 30px 12px 16px);
    ${({opaqueText}) => (opaqueText ? css`
        color: rgba(var(--center-channel-color-rgb), 1);
    ` : css`
        color: rgba(var(--center-channel-color-rgb), 0.72);
    `)}

    :hover {
        cursor: text;
    }

    p {
        white-space: pre-wrap;
    }
`;

// To reenable editing you have to put the following before ${HoverMenuContainer}
// ${CancelSaveContainer} {
//    padding: 8px 0;
// }
const MarkdownEditContainer = styled.div<{
    editing: boolean;
    dashed: boolean;
    noBorder?: boolean;
    borderColor?: string;
    opaqueText?: boolean;
    pointer?: boolean;
}>`
    position: relative;
    box-sizing: border-box;
    border-radius: var(--markdown-textbox-radius, 4px);

    && .custom-textarea.custom-textarea {
        ${commonTextStyle}
    }

    ${HoverMenuContainer} {
        opacity: 0
    }
    &:hover,
    &:focus-within {
        ${HoverMenuContainer} {
            opacity: 1;
        }

        ${({noBorder}) => noBorder && css`
            border: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
        `}
    }

    border: ${(props) => (props.dashed ? '1px dashed var(--center-channel-color-16)' : '1px solid var(--center-channel-color-08)')};
    border-color: ${(props) => (props.borderColor ? props.borderColor : 'var(--center-channel-color-08)')};
    ${({editing, noBorder}) => (editing || noBorder) && css`
        border-color: transparent;
    `}
    ${({pointer}) => (pointer) && css`
        cursor: pointer;
    `}
`;

export const RenderedText = styled.div`
    ${commonTextStyle}

    p:last-child {
        margin-bottom: 0;
    }
`;

const PlaceholderText = styled.span`
    font-style: italic;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

type MarkdownEditWithIDProps = {
    textBoxProps: MarkdownEditProps;
    id: string;
};

export const MarkdownEditWithID = ({textBoxProps, id}: MarkdownEditWithIDProps) => (
    <div id={id}>
        <MarkdownEdit {...textBoxProps}/>
    </div>
);

export default styled(MarkdownEdit)``;
