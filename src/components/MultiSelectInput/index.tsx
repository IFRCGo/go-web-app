import SearchMultiSelectInput, { SearchMultiSelectInputProps } from '#components/SearchMultiSelectInput';
import { rankedSearchOnList } from '#utils/common';

type Def = { containerClassName?: string };
type OptionKey = string | number;

export type MultiSelectInputProps<
    OPTION_KEY extends OptionKey,
    NAME,
    // eslint-disable-next-line @typescript-eslint/ban-types
    OPTION extends object,
    RENDER_PROPS extends Def,
> = SearchMultiSelectInputProps<OPTION_KEY, NAME, OPTION, RENDER_PROPS, 'onSearchValueChange' | 'searchOptions' | 'onShowDropdownChange' | 'totalOptionsCount'>;

// eslint-disable-next-line @typescript-eslint/ban-types
function MultiSelectInput<
    OPTION_KEY extends OptionKey,
    const NAME,
    OPTION extends object,
    RENDER_PROPS extends Def,
>(
    props: MultiSelectInputProps<OPTION_KEY, NAME, OPTION, RENDER_PROPS>,
) {
    const {
        name,
        options,
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
