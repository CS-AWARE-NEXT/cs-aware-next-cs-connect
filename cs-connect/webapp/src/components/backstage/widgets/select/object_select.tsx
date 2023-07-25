import React, {
    Dispatch,
    FC,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
} from 'react';
import {Empty, Select} from 'antd';
import {useIntl} from 'react-intl';
import styled from 'styled-components';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {buildQuery, useUrlHash} from 'src/hooks';
import {SelectObject} from 'src/types/object_select';
import {formatName} from 'src/helpers';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {IsRhsContext} from 'src/components/backstage/sections_widgets/sections_widgets_container';

type Props = {
    name: string;
    objects: SelectObject[];
    selectedObject: SelectObject;
    setSelectedObject: Dispatch<SetStateAction<SelectObject>>;
    children?: ReactNode;
    parentId: string;
    sectionId: string;
};

export const getObjectFromUrlHash = (urlHash: string): string => {
    return urlHash;
};

export const isInObjects = (data: SelectObject[], value: string): boolean => data.some((o) => o.value === value);

// TODO: Can be generalized by adding into the config a items field to configure instead of the url.
// This items will be a list of widget representing the objects in the select.
const ObjectSelect: FC<Props> = ({
    name,
    objects,
    selectedObject,
    setSelectedObject,
    children,
    parentId,
    sectionId,
}) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const isRhs = useContext(IsRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const id = `${formatName(name)}-${sectionId}-${parentId}`;
    const query = buildQuery(parentId, sectionId);

    const {formatMessage} = useIntl();
    const urlHash = useUrlHash();

    useEffect(() => {
        if (!urlHash || urlHash.length < 1) {
            return;
        }
        const object = getObjectFromUrlHash(urlHash);
        if (isInObjects(objects, object)) {
            setSelectedObject({value: object, label: object});
        }
    }, [urlHash]);

    const filterSort = (optionA: SelectObject, optionB: SelectObject): number => {
        return (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase());
    };

    const filterOption = (input: string, option: SelectObject | undefined): boolean => {
        return (option?.label ?? '').includes(input);
    };

    return (
        <Container
            id={id}
            data-testid={id}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={isEcosystemRhs ? '' : query}
                    text={name}
                    title={name}
                />
            </Header>
            <Select
                value={selectedObject.value}
                showSearch={true}
                style={isRhs ? {width: '100%'} : {width: 500}}
                placeholder={formatMessage({defaultMessage: 'Search or select'})}
                optionFilterProp='children'
                filterOption={filterOption}
                filterSort={filterSort}
                options={objects}
                onChange={(value) => setSelectedObject({value, label: value})}
            />
            <Object>
                {children && children}
                {!children && <Empty/>}
            </Object>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 24px;
`;

const Object = styled.div`
    border-radius: var(--markdown-textbox-radius, 4px);
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
    padding: 12px;
    margin-top: 12px;
`;

export default ObjectSelect;