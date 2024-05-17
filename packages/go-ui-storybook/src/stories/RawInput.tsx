import {
    RawInput as PureRawInput,
    RawInputProps as PureRawInputProps,
} from '@ifrc-go/ui';

interface RawInputProps<N> extends PureRawInputProps<N> {}

function WrappedRawInput<const N>(props: RawInputProps<N>) {
    return (
        <PureRawInput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedRawInput;
