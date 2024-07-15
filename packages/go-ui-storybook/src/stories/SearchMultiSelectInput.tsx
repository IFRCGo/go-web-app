import {
    OptionKey,
    SearchMultiSelectInput as PureSearchMultiSelectInput,
    SearchMultiSelectInputProps as PureSearchMultiSelectInputProps,
} from '@ifrc-go/ui';

// eslint-disable-next-line max-len
type SearchMultiSelectInputProps<K extends OptionKey, N, Option extends object, Def extends object > = PureSearchMultiSelectInputProps<K, N, Option, Def, never> ;

function SearchMultiSelectInput
<K extends OptionKey, const N, Option extends object, Def extends object>(
    props: SearchMultiSelectInputProps<K, N, Option, Def>,
) {
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <PureSearchMultiSelectInput {...props} />
    );
}

export default SearchMultiSelectInput;
