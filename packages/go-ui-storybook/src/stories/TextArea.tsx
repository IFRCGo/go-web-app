import {
    TextArea as PureTextArea,
    TextAreaProps as PureTextAreaProps,
} from '@ifrc-go/ui';

interface TextAreaProps<N> extends PureTextAreaProps<N> {}

function TextArea<const N>(props: TextAreaProps<N>) {
    return (
        <PureTextArea {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default TextArea;
