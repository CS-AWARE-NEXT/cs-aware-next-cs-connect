import styled from 'styled-components';

export const ErrorMessage = styled.div<{display?: boolean}>`
    color: var(--error-text);
    margin-left: auto;
    display: ${(props) => (props.display ? 'inline-block' : 'none')};
`;

export const PaddedErrorMessage = styled.div<{display?: boolean, marginBottom?: string, marginLeft?: string}>`
    color: var(--error-text);
    margin-bottom: ${(props) => (props.marginBottom ? props.marginBottom : 'auto')};
    margin-left: ${(props) => (props.marginLeft ? props.marginLeft : 'auto')};
    display: ${(props) => (props.display ? 'inline-block' : 'none')};
`;