import {
    RadioInput as PureRadioInput,
    RadioInputProps as PureRadioInputProps,
    RadioProps,
} from '@ifrc-go/ui';

// eslint-disable-next-line max-len
function RadioInput<const N, O extends object, V extends string | number | boolean, RRP extends RadioProps<V, N>>(props: PureRadioInputProps<N, O, V, RRP, never>) {
    return (
        <PureRadioInput {...props} /> // eslint-disable-line react/jsx-props-no-spreading
    );
}

export default RadioInput;
