import {
    Alert as PureAlert,
    AlertProps as PureAlertProps,
} from '@ifrc-go/ui';

interface AlertProps<N extends string> extends PureAlertProps<N> {}

function Alert<N extends string>(props: AlertProps<N>) {
    return (
        <PureAlert {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Alert;
