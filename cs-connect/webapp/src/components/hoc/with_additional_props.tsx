import {createElement} from 'react';

type Props = {};

const withAdditionalProps = (Component: any, additionalProps = {}): (props: any) => JSX.Element => {
    return (props: Props) => {
        return createElement(Component, {
            ...props,
            ...additionalProps,
        });
    };
};

export default withAdditionalProps;