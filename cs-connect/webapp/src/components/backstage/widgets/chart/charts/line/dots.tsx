import React, {
    FC,
    useContext,
    useEffect,
    useState,
} from 'react';
import {useIntl} from 'react-intl';
import {useRouteMatch} from 'react-router-dom';
import styled from 'styled-components';

import {Tooltip} from 'antd';

import {useToaster} from 'src/components/backstage/toast_banner';
import {FullUrlContext, IsRhsClosedContext} from 'src/components/rhs/rhs';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {
    buildQuery,
    buildTo,
    buildToForCopy,
    useUrlHash,
} from 'src/hooks';
import {copyToClipboard} from 'src/utils';
import {LineDot} from 'src/types/charts';
import {formatUrlAsMarkdown} from 'src/helpers';

export const DOT_PREFIX = 'dot-';

const dotStringify = (x: string, y: string, value: string | number): [string, string, string] => {
    const cxString = `${x}`.replace('.', 'dot');
    const cyString = `${y}`.replace('.', 'dot');
    const valueString = `${value}`.replace('.', 'dot');
    return [cxString, cyString, valueString];
};

export const valueStringify = (value: string | number): string => {
    return `${value}`.replace('.', 'dot');
};

export const idStringify = (id: string): string => {
    return `${id}`.replaceAll('-', 'hpn');
};

const isDotSelected = (selectedDot: LineDot, label: string, value: number): boolean => {
    return selectedDot.label === label && valueStringify(selectedDot.value) === valueStringify(value);
};

const getMsWithDelay = (delay: number, isEcosystemRhs: boolean): number => {
    if (delay < 2) {
        return isEcosystemRhs ? 1000 : 500;
    }
    return isEcosystemRhs ? delay * 600 : delay * 350;
};

type Props = any;

export const Dot: FC<Props> = (props) => {
    const {cx, cy, payload, value, originalColor, selectedDot, sectionId, delay, isOnScreen} = props;

    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const isRhsClosed = useContext(IsRhsClosedContext);
    const urlHash = useUrlHash();

    const [open, setOpen] = useState(false);
    const [color, setColor] = useState(originalColor);

    useEffect(() => {
        setOpen(false);

        // Time depends on the time needed for a scroll, in ecosystem rhs it needs more
        const ms = getMsWithDelay(delay, isEcosystemRhs);
        const urlHashTimeout = setTimeout(() => {
            if (!urlHash.startsWith('#dot-')) {
                setOpen(false);
                setColor(originalColor);
                return;
            }
            const isSelected = isDotSelected(selectedDot, payload.label, value);
            setOpen(isSelected);
            setColor(isSelected ? '#F4B400' : originalColor);
        }, ms); // timeout has to be higher than the one for scrolling, otherwise the tooltip won't be in the right position after scroll

        return () => {
            clearTimeout(urlHashTimeout);
        };
    }, [isRhsClosed, selectedDot, urlHash]);

    useEffect(() => {
        const isSelected = isDotSelected(selectedDot, payload.label, value);
        if (!isSelected) {
            return;
        }
        setOpen(isOnScreen);
    }, [isOnScreen]);

    // to put on separated lines: title={<div>{`${payload.label}`}<br/>{`${value}`}</div>}
    return (
        <Tooltip
            title={`${payload.label}: ${value}`}
            open={open}
        >
            <DotCircle
                id={`dot-${payload.label}-${valueStringify(value)}-${idStringify(sectionId)}`}
                cx={cx}
                cy={cy}
                r={4}
                fill={color}
            />
        </Tooltip>
    );
};

export const ClickableDot: FC<Props> = (props) => {
    const {cx, cy, payload, value, originalColor, selectedDot, parentId, sectionId} = props;

    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const {url} = useRouteMatch();
    const {formatMessage} = useIntl();
    const {add: addToast} = useToaster();

    const [color, setColor] = useState(originalColor);

    const ecosystemQuery = isEcosystemRhs ? '' : buildQuery(parentId, sectionId);
    const [,, valueString] = dotStringify(cx, cy, value);

    useEffect(() => {
        const isSelected = isDotSelected(selectedDot, payload.label, value);
        setColor(isSelected ? '#F4B400' : originalColor);
    }, [selectedDot]);

    const handleDotClick = (event: any) => {
        const itemId = `dot-${payload.label}-${valueString}-${idStringify(sectionId)}`;
        const name = `${payload.label}`;
        const path = buildToForCopy(buildTo(fullUrl, itemId, ecosystemQuery, url));
        copyToClipboard(formatUrlAsMarkdown(path, `${props.hyperlinkPath}.${name}`));
        addToast({content: formatMessage({defaultMessage: 'Copied!'})});
    };

    return (
        <DotCircle
            cx={cx}
            cy={cy}
            r={7}
            fill={color}
            onClick={handleDotClick}
        />
    );
};

const DotCircle = styled.circle`
    cursor: pointer;
`;
