import {
    OptionKey,
    SelectInput as PureSelectInput,
    SelectInputProps as PureSelectInputProps,
} from '@ifrc-go/ui';

// eslint-disable-next-line max-len
type SelectInputProps<K extends OptionKey, N, Option extends object, Def extends object > = PureSelectInputProps<K, N, Option, Def, never> ;

function SelectInput
<K extends OptionKey, const N, Option extends object, Def extends object>(
    props: SelectInputProps<K, N, Option, Def>,
) {
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <PureSelectInput {...props} />
    );
}

export default SelectInput;
