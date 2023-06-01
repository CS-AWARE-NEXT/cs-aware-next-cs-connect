import React, {Dispatch, SetStateAction, useMemo} from 'react';
import {useIntl} from 'react-intl';

import {getEmptySuggestions, getSuggestedText} from 'src/helpers';
import {useSuggestionsData} from 'src/hooks';

import 'src/styles/hyperlink_token_suggestion.scss';

type Props = {
    setIsVisible: Dispatch<SetStateAction<boolean>>;
};

const Suggestions = ({setIsVisible}: Props) => {
    const {formatMessage} = useIntl();

    const defaultData = useMemo(getEmptySuggestions, []);
    const {suggestions} = useSuggestionsData(defaultData);

    const onClick = (suggestion: string) => {
        const textarea = (document.getElementById('post_textbox') as HTMLTextAreaElement);
        textarea.value = getSuggestedText(textarea, suggestion);
        setIsVisible(false);
        textarea.focus();
    };

    return (
        <div
            id='hyperlink-token-suggestion'
            className='suggestion-list suggestion-list--top'
        >
            <div
                id='hyperlink-token-suggestion-list'
                role='list'
                className='suggestion-list__content suggestion-list__content--top'
            >
                <div className='suggestion-list__divider'>
                    <span>
                        <span>{'Suggestions'}</span>
                    </span>
                </div>
                {suggestions.length > 0 ?
                    suggestions.map(({id, text}) => (
                        <div
                            key={id}
                            className='hyperlink-token'
                            role='button'
                            onClick={() => onClick(text)}
                        >
                            <div className='hyperlink-token__icon'>
                                <span>{'#'}</span>
                            </div>
                            <div className='hyperlink-token__info'>
                                <div className='hyperlink-token__title'>{text}</div>
                            </div>
                        </div>
                    )) :
                    <div className='hyperlink-token'>
                        <div className='hyperlink-token__icon'>
                            <span>{'?'}</span>
                        </div>
                        <div className='hyperlink-token__info'>
                            <div className='hyperlink-token__title-no-content'>
                                {formatMessage({defaultMessage: 'No suggestions available'})}
                            </div>
                            <div className='hyperlink-token__desc'>
                                {formatMessage({defaultMessage: 'Please type or delete characters'})}
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default Suggestions;