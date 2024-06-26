import {
    TextArea as PureTextArea,
    TextAreaProps,
} from '@ifrc-go/ui';

function TextArea<const N>(props: TextAreaProps<N>) {
    return (
        <PureTextArea {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default TextArea;
