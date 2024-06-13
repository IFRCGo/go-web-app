import {
    PasswordInput as PurePasswordInput,
    PasswordInputProps as PurePasswordInputProps,
} from '@ifrc-go/ui';

interface PasswordInputProps<T> extends PurePasswordInputProps<T> {}

function PasswordInput<const T>(props: PasswordInputProps<T>) {
    return (
        <PurePasswordInput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default PasswordInput;
