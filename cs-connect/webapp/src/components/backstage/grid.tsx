import styled from 'styled-components';

export const HorizontalSplit = styled.div`
    display: block;
    text-align: left;
`;

export const VerticalSplit = styled.div`
    display: flex;
`;

export const HorizontalSpacer = styled.div<{ size: number }>`
    margin-left: ${(props) => props.size}px;
`;

export const VerticalSpacer = styled.div<{ size: number }>`
    margin-top: ${(props) => props.size}px;
`;

export const Spacer = styled.div`
    flex: 1;
`;

export const HorizontalSeparator = styled.div`
    border: none;
    border-top: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    margin: 16px 0;
    width: 100%;
`;