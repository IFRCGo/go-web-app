import {
    SegmentInput as PureSegmentInput,
    SegmentInputProps as PureSegmentInputProps,
} from '@ifrc-go/ui';

function SegmentInput<const N, O extends object, V extends string | number | boolean>(
    props: PureSegmentInputProps<N, O, V>,
) {
    return (
        <PureSegmentInput {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}
export default SegmentInput;
