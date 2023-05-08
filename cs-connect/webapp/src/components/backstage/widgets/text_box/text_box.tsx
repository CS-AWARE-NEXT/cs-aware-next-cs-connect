import React, {useContext} from 'react';
import styled from 'styled-components';
import {useIntl} from 'react-intl';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import MarkdownEdit from 'src/components/commons/markdown_edit';
import {buildQuery, formatName} from 'src/hooks';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';

export type TextBoxStyle = {
    height?: string;
    marginTop?: string;
    width?: string;
};

type Props = {
    idPrefix?: string;
    name: string;
    parentId: string;
    sectionId: string;
    style?: TextBoxStyle;
    text: string;
};

const TextBox = ({
    idPrefix = '',
    name,
    parentId,
    sectionId,
    text,
    style = {
        marginTop: '24px',
        width: '100%',
    },
}: Props) => {
    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);
    const {formatMessage} = useIntl();
    const id = `${idPrefix}${formatName(name)}-${sectionId}-${parentId}-widget`;
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
                    text={name}
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
    width: ${(props) => props.style.width};
    height: ${(props) => (props.style.height ? props.style.height : 'auto')};
    display: flex;
    flex-direction: column;
    margin-top: ${(props) => props.style.marginTop};
`;

export default TextBox;