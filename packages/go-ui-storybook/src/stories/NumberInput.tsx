import {
    NumberInput as PureNumberInput,
    type NumberInputProps,
} from '@ifrc-go/ui';

function NumberInput<const T>(props: NumberInputProps<T>) {
    return (
        <PureNumberInput {...props} />// eslint-disable-line react/jsx-props-no-spreading
    );
}

export default NumberInput;
