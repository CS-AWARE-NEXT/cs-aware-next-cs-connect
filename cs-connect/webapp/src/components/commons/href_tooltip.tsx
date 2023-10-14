import React, {FC, ReactNode} from 'react';
import {Tooltip} from 'antd';
import {TooltipPlacement} from 'antd/es/tooltip';

type Props = {
    title: string;
    href: string;
    placement?: TooltipPlacement;
    children?: ReactNode;
};

const HrefTooltip: FC<Props> = ({
    title,
    href,
    placement = 'top',
    children,
}): JSX.Element => {
    return (
        <Tooltip
            title={title}
            placement={placement}
        >
            <a
                href={href}
                target='blank'
            >
                {children}
            </a>
        </Tooltip>
    );
};

export default HrefTooltip;