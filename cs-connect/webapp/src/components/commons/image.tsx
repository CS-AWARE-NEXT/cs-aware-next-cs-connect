import React, {FC, MouseEvent} from 'react';
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

export const ImageWithCursor = styled.img<{borderBox?: string}>`
    cursor: pointer;
    transition: transform 0.3s ease-in-out;

    box-shadow: ${(props) => (props.borderBox ? props.borderBox : '')};

    &:hover {
        transform: scale(1.1);
    }
`;

export type ClickableImageProps = {
    id: string;
    alt: string;
    width: string | number;
    src: string;
    borderBox?: string;
    onClick?: (e: MouseEvent) => void,
};

export const ClickableImage: FC<ClickableImageProps> = ({
    id,
    alt,
    width,
    src,
    borderBox,
    onClick,
}) => {
    return (
        <ImageWithCursor
            id={id}
            alt={alt}
            width={width}
            src={src}
            borderBox={borderBox}
            onClick={onClick}
        />
    );
};