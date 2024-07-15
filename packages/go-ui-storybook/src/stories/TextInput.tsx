import {
    TextInput as PureTextInput,
    TextInputProps,
} from '@ifrc-go/ui';

function TextInput<const T>(props: TextInputProps<T>) {
    return (
        <PureTextInput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default TextInput;
