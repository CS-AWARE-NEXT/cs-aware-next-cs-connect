import styled from 'styled-components';

export const ImageBox = styled.img`
    max-width: 60%;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 4px #ccc, -2px -2px 4px #ccc;
    margin-bottom: 12px;
`;

export const ImageBoxLarge = styled(ImageBox)`
    max-width: 80%;
`;

export const ImageBoxFull = styled(ImageBox)`
    max-width: 100%;
`;