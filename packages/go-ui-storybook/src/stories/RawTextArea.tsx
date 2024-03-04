import {
    RawTextArea as PureRawTextArea,
    RawTextAreaProps as PureRawTextAreaProps,
} from '@ifrc-go/ui';

interface RawTextAreaProps<N> extends PureRawTextAreaProps<N> {}

function WrappedRawTextArea<const N>(props: RawTextAreaProps<N>) {
    return (
        <PureRawTextArea {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedRawTextArea;
