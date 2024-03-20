import {
    PasswordInput as PurePasswordInput,
    PasswordInputProps as PurePasswordInputProps,
} from '@ifrc-go/ui';

interface PasswordInputProps<T> extends PurePasswordInputProps<T> {}

function WrappedPasswordInput<const T>(props: PasswordInputProps<T>) {
    return (
        <PurePasswordInput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedPasswordInput;
