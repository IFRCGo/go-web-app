import SearchMultiSelectInput, { SearchMultiSelectInputProps } from '#components/SearchMultiSelectInput';
import { rankedSearchOnList } from '#utils/common';
import { useCallback } from 'react';

type Def = { containerClassName?: string };
type OptionKey = string | number;

export type MultiSelectInputProps<
    OPTION_KEY extends OptionKey,
    NAME,
    // eslint-disable-next-line @typescript-eslint/ban-types
    OPTION extends object,
    RENDER_PROPS extends Def,
    OMISSION extends string,
> = SearchMultiSelectInputProps<
    OPTION_KEY,
    NAME,
    OPTION,
    RENDER_PROPS,
    OMISSION | 'onSearchValueChange' | 'searchOptions' | 'onShowDropdownChange' | 'totalOptionsCount' | 'onSelectAllButtonClick'
> & {
    withSelectAll?: boolean;
};

// eslint-disable-next-line @typescript-eslint/ban-types
function MultiSelectInput<
    OPTION_KEY extends OptionKey,
    const NAME,
    OPTION extends object,
    RENDER_PROPS extends Def,
>(
    props: MultiSelectInputProps<OPTION_KEY, NAME, OPTION, RENDER_PROPS, never>,
) {
    const {
        name,
        options,
        keySelector,
        onChange,
        withSelectAll,
        ...otherProps
    } = props;

    const handleSelectAll = useCallback(
        () => {
            if (!options) {
                return;
            }

            const allValues = options?.map(keySelector);
            onChange(allValues, name);
        },
        [options, name, onChange, keySelector],
    );

    return (
        <SearchMultiSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            name={name}
            onChange={onChange}
            options={options}
            keySelector={keySelector}
            sortFunction={rankedSearchOnList}
            searchOptions={options}
            onSelectAllButtonClick={withSelectAll ? handleSelectAll : undefined}
        />
    );
}

export default MultiSelectInput;
