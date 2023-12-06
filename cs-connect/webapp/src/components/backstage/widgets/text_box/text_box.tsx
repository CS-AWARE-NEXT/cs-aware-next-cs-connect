import React, {useContext} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import MarkdownEdit from 'src/components/commons/markdown_edit';
import {buildQuery} from 'src/hooks';
import {formatName} from 'src/helpers';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';

export type TextBoxStyle = {
    height?: string;
    marginTop?: string;
    marginRight?: string;
    width?: string;
};

type Props = {
    idPrefix?: string;
    name: string;
    parentId: string;
    sectionId: string;
    style?: TextBoxStyle;
    text: string;
    customId?: string;
    titleText?: string;
};

const TextBox = ({
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
            <MarkdownEdit
                placeholder={placeholder}
                value={text}
            />
        </Container>
    );
};

const Container = styled.div<{style: TextBoxStyle}>`
    width: ${(props) => (props.style.width ? props.style.width : '100%')};
    height: ${(props) => (props.style.height ? props.style.height : 'auto')};
    display: flex;
    flex-direction: column;
    margin-top: ${(props) => (props.style.marginTop ? props.style.marginTop : '24px')};
    margin-top: ${(props) => (props.style.marginRight ? props.style.marginRight : '0')};
`;

export default TextBox;
