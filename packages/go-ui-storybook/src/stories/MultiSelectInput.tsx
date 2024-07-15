import {
    MultiSelectInput as PureMultiSelectInput,
    MultiSelectInputProps as PureMultiSelectInputProps,
    OptionKey,
} from '@ifrc-go/ui';

// eslint-disable-next-line max-len
type MultiSelectInputProps<K extends OptionKey, N, Option extends object, Def extends object > = PureMultiSelectInputProps<K, N, Option, Def, never> ;

function MultiSelectInput
<K extends OptionKey, const N, Option extends object, Def extends object>(
    props: MultiSelectInputProps<K, N, Option, Def>,
) {
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <PureMultiSelectInput {...props} />
    );
}

export default MultiSelectInput;
