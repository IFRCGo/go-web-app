import {
    RawButton as PureRawButton,
    RawButtonProps as PureRawButtonProps,
} from '@ifrc-go/ui';

interface RawButtonProps<N> extends PureRawButtonProps<N> {}

function WrappedRawButton<const N>(props: RawButtonProps<N>) {
    return (
        <PureRawButton {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedRawButton;
