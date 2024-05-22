import {
    NumberInput as PureNumberInput,
    NumberInputProps as PureNumberInputProps,
} from '@ifrc-go/ui';

interface NumberInputProps<T> extends PureNumberInputProps<T> {}

function WrappedNumberInput<const T>(props: NumberInputProps<T>) {
    return (
        <PureNumberInput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default WrappedNumberInput;