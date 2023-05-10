import React, {ComponentType} from 'react';
import {createPortal} from 'react-dom';

import {useHideOptions, useSuggestions, useUserAdded} from 'src/hooks';
import Suggestions from 'src/components/chat/suggestions';

import 'src/styles/hyperlink_token_suggestion.scss';

const withPlatformOperations = (Component: ComponentType): (props: any) => JSX.Element => {
    return (props: any): JSX.Element => {
        useUserAdded();
        useHideOptions();
        const [suggestions, isVisible] = useSuggestions();
        return (
            <>
                <Component {...props}/>
                {(suggestions && isVisible) && createPortal(<Suggestions/>, suggestions)}
            </>
        );
    };
};

export default withPlatformOperations;
