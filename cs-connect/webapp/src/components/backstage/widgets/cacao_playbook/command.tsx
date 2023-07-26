import React, {useContext} from 'react';
import {useIntl} from 'react-intl';

import {AnchorLinkTitle, Header} from 'src/components/backstage/widgets/shared';
import {FullUrlContext} from 'src/components/rhs/rhs';
import {buildQuery} from 'src/hooks';
import {IsEcosystemRhsContext} from 'src/components/rhs/rhs_widgets';
import {formatName, formatStringToCapitalize} from 'src/helpers';
import TextBox from 'src/components/backstage/widgets/text_box/text_box';
import {SelectObject, defaultSelectObject} from 'src/types/object_select';

import {Container, HorizontalContainer} from './playbook';

type Props = {
    command: any;
    parentId: string;
    sectionId: string;
};

// TODO: type has to be changed to the id when solved
export const getFirstCommandObject = (commands: any[] | undefined): SelectObject => {
    if (!commands || commands.length < 1) {
        return defaultSelectObject;
    }
    return {
        label: commands[0].type as string,
        value: commands[0].type as string,
    };
};

// TODO: type has to be changed to the id when solved
export const getCommandObjects = (commands: any[] | undefined): SelectObject[] => {
    if (!commands || commands.length < 1) {
        return [];
    }
    return commands.map(({type}) => ({
        label: type as string,
        value: type as string,
    }));
};

// TODO: type has to be changed to the id when solved
export const getCommandById = (commands: any[], id: string): any => {
    return commands.find((command) => command.type === id);
};

// TODO: enrich with unique id
const CacaoCommand = ({
    command,
    parentId,
    sectionId,
}: Props) => {
    console.log('command', {command});
    const {formatMessage} = useIntl();

    const isEcosystemRhs = useContext(IsEcosystemRhsContext);
    const fullUrl = useContext(FullUrlContext);

    const prefix = `${command.id}-`;
    const name = command.name ?? command.id;
    const id = `${formatName(command.id)}-${sectionId}-${parentId}`;
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
                    text={name}
                    title={name}
                />
            </Header>
            <HorizontalContainer>
                {command.type &&
                    <TextBox
                        idPrefix={prefix}
                        name={formatMessage({defaultMessage: 'Type'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={formatStringToCapitalize(command.type)}
                        style={{marginTop: '24px', marginRight: '8px'}}
                    />}
                {command.playbook_activity &&
                    <TextBox
                        idPrefix={prefix}
                        name={formatMessage({defaultMessage: 'Playbook Activity'})}
                        sectionId={sectionId}
                        parentId={parentId}
                        text={command.playbook_activity}
                    />}
            </HorizontalContainer>
            {command.description &&
                <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'Description'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={command.description}
                />}
            {command.command &&
                <TextBox
                    idPrefix={prefix}
                    name={formatMessage({defaultMessage: 'Command'})}
                    sectionId={sectionId}
                    parentId={parentId}
                    text={command.command}
                />}
        </Container>
    );
};

export default CacaoCommand;