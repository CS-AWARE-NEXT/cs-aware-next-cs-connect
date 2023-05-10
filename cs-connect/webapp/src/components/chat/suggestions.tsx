import React, {MouseEvent} from 'react';

const Suggestions = () => {
    const onClick = (e: MouseEvent) => {
        e.preventDefault();
        alert('Received click event!');
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
                <div
                    className='hyperlink-token'
                    role='button'
                    onClick={(e) => onClick(e)}
                >
                    <div className='hyperlink-token__icon'>
                        <span>{'#'}</span>
                    </div>
                    <div className='hyperlink-token__info'>
                        <div className='hyperlink-token__title'>{'Organization X'}</div>
                    </div>
                </div>
                <div
                    className='hyperlink-token'
                    role='button'
                    onClick={(e) => onClick(e)}
                >
                    <div className='hyperlink-token__icon'>
                        <span>{'#'}</span>
                    </div>
                    <div className='hyperlink-token__info'>
                        <div className='hyperlink-token__title'>{'Organization Y'}</div>
                    </div>
                </div>
                <div
                    className='hyperlink-token'
                    role='button'
                    onClick={(e) => onClick(e)}
                >
                    <div className='hyperlink-token__icon'>
                        <span>{'#'}</span>
                    </div>
                    <div className='hyperlink-token__info'>
                        <div className='hyperlink-token__title'>{'Organization Z'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Suggestions;