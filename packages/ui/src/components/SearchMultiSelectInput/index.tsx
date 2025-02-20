import type {
    Dispatch,
    SetStateAction,
} from 'react';
import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
    isTruthyString,
    listToMap,
    unique,
} from '@togglecorp/fujs';

import SelectInputContainer, { SelectInputContainerProps } from '#components/SelectInputContainer';
import { rankedSearchOnList } from '#utils/common';

import Option from './Option';

import styles from './styles.module.css';

type Def = { containerClassName?: string, title?: string; };
type OptionKey = string | number;

export type SearchMultiSelectInputProps<
    OPTION_KEY extends OptionKey,
    NAME,
    OPTION extends object,
    RENDER_PROPS extends Def,
    OMISSION extends string,
> = (
    Omit<{
        value: OPTION_KEY[] | undefined | null;
        onChange: (newValue: OPTION_KEY[], name: NAME) => void;
        options: OPTION[] | undefined | null;
        searchOptions?: OPTION[] | undefined | null;
        keySelector: (option: OPTION) => OPTION_KEY;
        labelSelector: (option: OPTION) => string;
        hideOptionFilter?: (option: OPTION) => boolean;
        name: NAME;
        disabled?: boolean;
        readOnly?: boolean;
        onOptionsChange?: Dispatch<SetStateAction<OPTION[] | undefined | null>>;
        sortFunction?: (
            options: OPTION[],
            search: string | undefined,
            labelSelector: (option: OPTION) => string,
        ) => OPTION[];
        onSearchValueChange?: (value: string | undefined) => void;
        onShowDropdownChange?: (value: boolean) => void;

        selectedOnTop: boolean;
    }, OMISSION>
    & SelectInputContainerProps<OPTION_KEY, NAME, OPTION, RENDER_PROPS,
        'name'
        | 'nonClearable'
        | 'onClearButtonClick'
        | 'onOptionClick'
        | 'optionKeySelector'
        | 'optionRenderer'
        | 'optionRendererParams'
        | 'optionsFiltered'
        | 'persistentOptionPopup'
        | 'valueDisplay'
        | 'optionContainerClassName'
        | 'searchText'
        | 'onSearchTextChange'
        | 'dropdownShown'
        | 'onDropdownShownChange'
        | 'focused'
        | 'onFocusedChange'
        | 'focusedKey'
        | 'onFocusedKeyChange'
        | 'hasValue'
        | 'hideOptionFilter'
        | OMISSION
    >
);
const emptyList: unknown[] = [];

function SearchMultiSelectInput<
    OPTION_KEY extends OptionKey,
    const NAME,
    OPTION extends object,
    RENDER_PROPS extends Def,
>(
    props: SearchMultiSelectInputProps<OPTION_KEY, NAME, OPTION, RENDER_PROPS, never>,
) {
    const {
        keySelector,
        labelSelector,
        name,
        onChange,
        onOptionsChange,
        options: optionsFromProps,
        optionsPending,
        optionsErrored,
        value: valueFromProps,
        sortFunction,
        searchOptions: searchOptionsFromProps,
        onSearchValueChange,
        onShowDropdownChange,
        hideOptionFilter,
        selectedOnTop,
        ...otherProps
    } = props;

    const options = optionsFromProps ?? (emptyList as OPTION[]);
    const searchOptions = searchOptionsFromProps ?? (emptyList as OPTION[]);
    const value = valueFromProps ?? (emptyList as OPTION_KEY[]);

    const [searchInputValue, setSearchInputValue] = useState<string | undefined>();
    const [showDropdown, setShowDropdown] = useState(false);
    const [focused, setFocused] = useState(false);
    const [
        focusedKey,
        setFocusedKey,
    ] = useState<{ key: OPTION_KEY, mouse?: boolean } | undefined>();

    const [selectedKeys, setSelectedKeys] = useState<{
        [key: string]: boolean,
    }>({});

    const optionsMap = useMemo(
        () => (
            listToMap(options, keySelector, (i) => i)
        ),
        [options, keySelector],
    );

    const optionsLabelMap = useMemo(
        () => (
            listToMap(options, keySelector, labelSelector)
        ),
        [options, keySelector, labelSelector],
    );

    const valueDisplay = useMemo(
        () => (
            value.map((v) => optionsLabelMap[v] ?? '?').join(', ')
        ),
        [value, optionsLabelMap],
    );

    // NOTE: we can skip this calculation if optionsShowInitially is false
    const selectedOptions = useMemo(
        () => value.map((valueKey) => optionsMap[valueKey]).filter(isDefined),
        [value, optionsMap],
    );

    const realOptions = useMemo(
        () => {
            const allOptions = unique(
                [...searchOptions, ...selectedOptions],
                keySelector,
            );

            if (!selectedOnTop) {
                return sortFunction
                    ? sortFunction(allOptions, searchInputValue, labelSelector)
                    : allOptions;
            }

            const initiallySelected = allOptions
                .filter((item) => selectedKeys[keySelector(item)]);
            const initiallyNotSelected = allOptions
                .filter((item) => (
                    !selectedKeys[keySelector(item)]
                    && (isNotDefined(hideOptionFilter) || hideOptionFilter(item))
                ));

            if (sortFunction) {
                return [
                    ...rankedSearchOnList(initiallySelected, searchInputValue, labelSelector),
                    ...sortFunction(initiallyNotSelected, searchInputValue, labelSelector),
                ];
            }

            return [
                ...rankedSearchOnList(initiallySelected, searchInputValue, labelSelector),
                ...initiallyNotSelected,
            ];
        },
        [
            selectedOnTop,
            keySelector,
            labelSelector,
            searchInputValue,
            searchOptions,
            selectedKeys,
            selectedOptions,
            sortFunction,
            hideOptionFilter,
        ],
    );

    const handleSearchValueChange = useCallback(
        (searchValue: string | undefined) => {
            setSearchInputValue(searchValue);
            if (onSearchValueChange) {
                onSearchValueChange(searchValue);
            }
        },
        [onSearchValueChange],
    );

    const handleChangeDropdown = useCallback(
        (myVal: boolean) => {
            setShowDropdown(myVal);
            if (onShowDropdownChange) {
                onShowDropdownChange(myVal);
            }
            if (myVal) {
                setSelectedKeys(
                    listToMap(
                        value,
                        (item) => item,
                        () => true,
                    ),
                );
                setFocusedKey(undefined);
            } else {
                setSelectedKeys({});
                setFocusedKey(undefined);
                setSearchInputValue(undefined);
                if (onSearchValueChange) {
                    onSearchValueChange(undefined);
                }
            }
        },
        [value, onSearchValueChange, onShowDropdownChange],
    );

    const optionRendererParams = useCallback(
        (key: OptionKey, option: OPTION) => {
            const isActive = value.findIndex((item) => item === key) !== -1;

            return {
                children: labelSelector(option),
                containerClassName: _cs(styles.option, isActive && styles.active),
                title: labelSelector(option),
                isActive,

                labelClassName: styles.label,
                iconClassName: styles.icon,
            };
        },
        [labelSelector, value],
    );

    // FIXME: value should not be on dependency list, also try to pass options like in SelectInput
    const handleOptionClick = useCallback(
        (k: OPTION_KEY, v: OPTION) => {
            const newValue = [...value];

            const optionKeyIndex = value.findIndex((d) => d === k);
            if (optionKeyIndex !== -1) {
                newValue.splice(optionKeyIndex, 1);
            } else {
                newValue.push(k);

                if (onOptionsChange) {
                    onOptionsChange(((existingOptions) => {
                        const safeOptions = existingOptions ?? [];
                        const opt = safeOptions.find((item) => keySelector(item) === k);
                        if (opt) {
                            return existingOptions;
                        }
                        return [...safeOptions, v];
                    }));
                }
            }

            onChange(newValue, name);
        },
        [value, onChange, name, onOptionsChange, keySelector],
    );

    const handleClear = useCallback(
        () => {
            onChange([], name);
        },
        [name, onChange],
    );

    return (
        <SelectInputContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            name={name}
            options={realOptions}
            optionsPending={optionsPending}
            optionsFiltered={isTruthyString(searchInputValue) && searchInputValue.length > 0}
            optionsErrored={optionsErrored}
            optionKeySelector={keySelector}
            optionRenderer={Option}
            optionRendererParams={optionRendererParams}
            optionContainerClassName={styles.optionContainer}
            onOptionClick={handleOptionClick}
            valueDisplay={valueDisplay}
            onClearButtonClick={handleClear}
            searchText={searchInputValue}
            onSearchTextChange={handleSearchValueChange}
            dropdownShown={showDropdown}
            onDropdownShownChange={handleChangeDropdown}
            focused={focused}
            onFocusedChange={setFocused}
            focusedKey={focusedKey}
            onFocusedKeyChange={setFocusedKey}
            persistentOptionPopup
            nonClearable={false}
            hasValue={isDefined(value) && value.length > 0}
        />
    );
}

export default SearchMultiSelectInput;
