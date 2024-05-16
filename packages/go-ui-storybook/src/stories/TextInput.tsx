import {
    TextInput as PureTextInput,
    TextInputProps as PureTextInputProps,
} from '@ifrc-go/ui';

interface TextInputProps<T> extends PureTextInputProps<T> {}

function WrappedTextInput<const T>(props: TextInputProps<T>) {
    return (
        <PureTextInput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedTextInput;
