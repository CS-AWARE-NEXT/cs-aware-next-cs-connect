import React, {useContext} from 'react';
import {useIntl} from 'react-intl';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {formatName} from 'src/helpers';
import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {SelectObject, defaultSelectObject} from 'src/types/object_select';

import {Container, HorizontalContainer} from './playbook';

type Props = {
    data: any;
    parentId: string;
    sectionId: string;
};

export const getFirstExternalReferenceObject = (externalReferences: any[] | undefined): SelectObject => {
    if (!externalReferences || externalReferences.length < 1) {
        return defaultSelectObject;
    }
    return {
        label: externalReferences[0].name as string,
        value: externalReferences[0].name as string,
    };
};

export const getExternalReferenceObjectByFormattedName = (externalReferences: any[] | undefined, name: string): SelectObject => {
    if (!externalReferences || externalReferences.length < 1) {
        return defaultSelectObject;
    }
    const externalReferenceByName = externalReferences.find((externalReference) => formatName(externalReference.name) === name);
    return {
        label: externalReferenceByName.name,
        value: externalReferenceByName.name,
    };
};

export const getExternalReferenceObjects = (externalReferences: any[] | undefined): SelectObject[] => {
    if (!externalReferences || externalReferences.length < 1) {
        return [];
    }
    return externalReferences.map(({name}) => ({
        label: name as string,
        value: name as string,
    }));
};

export const getExternalReferenceByName = (externalReferences: any[], name: string): any => {
    return externalReferences.find((externalReference) => externalReference.name === name);
};

export const getExternalReferencesFormattedNames = (externalReferences: any[]): string[] => {
    if (!externalReferences || externalReferences.length < 1) {
        return [];
    }
    return externalReferences.map((externalReference) => {
        return formatName(externalReference.name);
    });
};

const CacaoExternalReference = ({
    data,
    parentId,
    sectionId,
}: Props) => {
    const {formatMessage} = useIntl();

    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const name = `${formatName(data.name)}-`;
    const id = `${name}-${sectionId}-${parentId}`;
    const query = buildQuery(parentId, sectionId);

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
                    text={data.name}
                    title={data.name}
                />
            </Header>
            {data.description &&
                <TextBox
                    idPrefix={name}
                    name={formatMessage({defaultMessage: 'Description'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={data.description}
                />
            }
            {data.source &&
                <TextBox
                    idPrefix={name}
                    name={formatMessage({defaultMessage: 'Source'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={data.source}
                    style={{marginTop: '24px', marginRight: '8px'}}
                />}

            {data.url &&
                <TextBox
                    idPrefix={name}
                    name={formatMessage({defaultMessage: 'Url'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={data.url}
                />}
            <HorizontalContainer>
                {data.external_id &&
                    <TextBox
                        idPrefix={name}
                        name={formatMessage({defaultMessage: 'External ID'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={data.external_id}
                        style={{marginTop: '24px', marginRight: '8px'}}
                    />}
                {data.reference_id &&
                    <TextBox
                        idPrefix={name}
                        name={formatMessage({defaultMessage: 'Reference ID'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={data.reference_id}
                    />}
            </HorizontalContainer>
        </Container>
    );
};

export default CacaoExternalReference;