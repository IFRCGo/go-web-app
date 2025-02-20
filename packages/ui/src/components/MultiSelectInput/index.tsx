import { useCallback } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import SearchMultiSelectInput, { SearchMultiSelectInputProps } from '#components/SearchMultiSelectInput';
import { rankedSearchOnList } from '#utils/common';

type Def = { containerClassName?: string };
type OptionKey = string | number;

export type MultiSelectInputProps<
    OPTION_KEY extends OptionKey,
    NAME,
    OPTION extends object,
    RENDER_PROPS extends Def,
    OMISSION extends string,
> = SearchMultiSelectInputProps<
    OPTION_KEY,
    NAME,
    OPTION,
    RENDER_PROPS,
    OMISSION | 'onSearchValueChange' | 'searchOptions' | 'onShowDropdownChange' | 'totalOptionsCount' | 'onSelectAllButtonClick'
    | 'selectedOnTop'
> & {
    withSelectAll?: boolean;
};

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
            if (isNotDefined(options)) {
                return;
            }

            const allValues = options.map(keySelector);
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
            selectedOnTop={false}
        />
    );
}

export default MultiSelectInput;
