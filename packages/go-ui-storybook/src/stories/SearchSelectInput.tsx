import {
    OptionKey,
    SearchSelectInput as PureSearchSelectInput,
    SearchSelectInputProps as PureSearchSelectInputProps,
} from '@ifrc-go/ui';

// eslint-disable-next-line max-len
type SearchSelectInputProps<K extends OptionKey, N, Option extends object, Def extends object > = PureSearchSelectInputProps<K, N, Option, Def, never> ;

function SearchSelectInput
<K extends OptionKey, const N, Option extends object, Def extends object>(
    props: SearchSelectInputProps<K, N, Option, Def>,
) {
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <PureSearchSelectInput {...props} />
    );
}

export default SearchSelectInput;
