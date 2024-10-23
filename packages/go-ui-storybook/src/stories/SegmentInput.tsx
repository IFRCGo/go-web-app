import {
    RadioProps,
    SegmentInput as PureSegmentInput,
    SegmentInputProps as PureSegmentInputProps,
} from '@ifrc-go/ui';

function SegmentInput<const N, O extends object, V
extends string | number | boolean, RRP extends RadioProps<V, N>>(
    props: PureSegmentInputProps<N, O, V, RRP>,
) {
    return (
        <PureSegmentInput {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}
export default SegmentInput;
