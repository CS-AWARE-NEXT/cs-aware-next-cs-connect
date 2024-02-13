import React, {useContext} from 'react';
import {useIntl} from 'react-intl';
import {MenuProps} from 'antd';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import MarkdownEdit from 'src/components/commons/markdown_edit';
import {buildQuery, isReferencedByUrlHash, useUrlHash} from 'src/hooks';
import {formatName} from 'src/helpers';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {VerticalSpacer} from 'src/components/backstage/grid';

import {Container, TextBoxStyle} from './text_box';

export type MultiText = {
    text: string;
    id?: string;

    pointer?: boolean;
    tooltipText?: string;
    onClick?: () => void;
    dropdownItems?: MenuProps['items'];
    dropdownTrigger?: ('click' | 'hover' | 'contextMenu')[];
};

type Props = {
    idPrefix?: string;
    name: string;
    parentId: string;
    sectionId: string;
    style?: TextBoxStyle;
    text: MultiText[];
    customId?: string;
    titleText?: string;
};

const MultiTextBox = ({
    idPrefix = '',
    name,
    parentId,
    sectionId,
    text,
    style = {
        marginTop: '24px',
        marginRight: '0px',
        width: '100%',
    },
    customId,
    titleText,
}: Props) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const {formatMessage} = useIntl();
    const id = customId || `${idPrefix}${formatName(name)}-${sectionId}-${parentId}-widget`;
    const placeholder = formatMessage({defaultMessage: 'There\'s no text to show'});
    const urlHash = useUrlHash();

    return (
        <Container
            id={id}
            data-testid={id}
            style={style}
        >
            <Header>
                <AnchorLinkTitle
                    fullUrl={fullUrl}
                    id={id}
                    query={isEcosystemRhs ? '' : buildQuery(parentId, sectionId)}
                    text={titleText || name}
                    title={name}
                />
            </Header>
            {text.map((txt, i) => (
                <>
                    <MarkdownEdit
                        key={`text-${i}`}
                        placeholder={placeholder}
                        value={txt.text}
                        borderColor={isReferencedByUrlHash(urlHash, id) ? 'rgb(244, 180, 0)' : undefined}
                        pointer={txt.pointer || false}
                        tooltipText={txt.tooltipText}
                        onClick={txt.onClick}
                        dropdownItems={txt.dropdownItems}
                        dropdownTrigger={txt.dropdownTrigger}
                    />
                    <VerticalSpacer size={8}/>
                </>
            ))}
        </Container>
    );
};

export default MultiTextBox;
