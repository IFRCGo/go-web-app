import {
    ConfirmButton as PureConfirmButton,
    ConfirmButtonProps as PureConfirmButtonProps,
} from '@ifrc-go/ui';

interface ConfirmButtonProps<N> extends PureConfirmButtonProps<N> {}

function WrappedConfirmButton<const N>(props: ConfirmButtonProps<N>) {
    return (
        <PureConfirmButton {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedConfirmButton;