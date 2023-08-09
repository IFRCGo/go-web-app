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
> = SearchMultiSelectInputProps<OPTION_KEY, NAME, OPTION, RENDER_PROPS, 'onSearchValueChange' | 'searchOptions' | 'onShowDropdownChange' | 'totalOptionsCount'> & {
    showSelectAllButton?: boolean;
};

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
        keySelector,
        onChange,
        showSelectAllButton,
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
            onSelectAllButtonClick={showSelectAllButton ? handleSelectAll : undefined}
        />
    );
}

export default MultiSelectInput;
