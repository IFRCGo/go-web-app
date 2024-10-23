import {
    Alert as PureAlert,
    AlertProps as PureAlertProps,
} from '@ifrc-go/ui';

type AlertProps<N extends string> = PureAlertProps<N>;

function Alert<N extends string>(props: AlertProps<N>) {
    return (
        <PureAlert {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default Alert;
