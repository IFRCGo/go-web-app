import SearchMultiSelectInput, { SearchMultiSelectInputProps } from '#components/SearchMultiSelectInput';
import { rankedSearchOnList } from '#utils/common';

type Def = { containerClassName?: string };
type OptionKey = string | number;

export type MultiSelectInputProps<
    T extends OptionKey,
    K extends string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    O extends object,
    P extends Def,
> = SearchMultiSelectInputProps<T, K, O, P, 'onSearchValueChange' | 'searchOptions' | 'onShowDropdownChange' | 'totalOptionsCount'>;

// eslint-disable-next-line @typescript-eslint/ban-types
function MultiSelectInput<T extends OptionKey, K extends string, O extends object, P extends Def>(
    props: MultiSelectInputProps<T, K, O, P>,
) {
    const {
        name,
        options,
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        totalOptionsCount,
        ...otherProps
    } = props;

    return (
        <SearchMultiSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            name={name}
            options={options}
            sortFunction={rankedSearchOnList}
            searchOptions={options}
        />
    );
}

export default MultiSelectInput;
