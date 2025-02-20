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

export type Props<
    OPTION_KEY extends OptionKey,
    NAME,
    OPTION extends object,
    RENDER_PROPS extends Def,
    OMISSION extends string,
> = (
    Omit<{
        value: OPTION_KEY | undefined | null;
        options: OPTION[] | undefined | null;
        searchOptions?: OPTION[] | undefined | null;
        keySelector: (option: OPTION) => OPTION_KEY;
        labelSelector: (option: OPTION) => string;
        descriptionSelector?: (option: OPTION) => string;
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
        onEnterWithoutOption?: (value: string | undefined) => void;

        selectedOnTop: boolean;
    }, OMISSION>
    & SelectInputContainerProps<OPTION_KEY, NAME, OPTION, RENDER_PROPS,
        'name'
        | 'nonClearable'
        | 'onClearButtonClick'
        | 'onOptionClick'
        | 'options'
        | 'optionKeySelector'
        | 'optionRenderer'
        | 'optionRendererParams'
        | 'optionsFiltered'
        | 'persistentOptionPopup'
        | 'valueDisplay'
        | 'optionContainerClassName'
        | 'searchText'
        | 'options'
        | 'onOptionsChange'
        | 'onSearchTextChange'
        | 'dropdownShown'
        | 'onDropdownShownChange'
        | 'focused'
        | 'onFocusedChange'
        | 'focusedKey'
        | 'onFocusedKeyChange'
        | 'hasValue'
        | 'hideOptionFilter'
        | 'onSelectAllButtonClick'
        | 'onEnterWithoutOption'
        | OMISSION
    >
    & ({
        nonClearable: true,
        onChange: (newValue: OPTION_KEY, name: NAME, value: OPTION) => void,
    } | {
        nonClearable?: false,
        onChange: (newValue: OPTION_KEY | undefined, name: NAME, value: OPTION | undefined) => void;
    })
);

const emptyList: unknown[] = [];

function SearchSelectInput<
    OPTION_KEY extends OptionKey,
    const NAME,
    OPTION extends object,
    RENDER_PROPS extends Def,
>(
    props: Props<OPTION_KEY, NAME, OPTION, RENDER_PROPS, never>,
) {
    const {
        keySelector,
        labelSelector,
        descriptionSelector,
        name,
        onChange,
        onOptionsChange,
        options: optionsFromProps,
        optionsPending,
        optionsErrored,
        value,
        sortFunction,
        searchOptions: searchOptionsFromProps,
        onSearchValueChange,
        onShowDropdownChange,
        hideOptionFilter,
        selectedOnTop,
        onEnterWithoutOption,
        ...otherProps
    } = props;

    const options = optionsFromProps ?? (emptyList as OPTION[]);
    const searchOptions = searchOptionsFromProps ?? (emptyList as OPTION[]);

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

    const optionsLabelMap = useMemo(
        () => (
            listToMap(options, keySelector, labelSelector)
        ),
        [options, keySelector, labelSelector],
    );

    const valueDisplay = isDefined(value) ? optionsLabelMap[value] ?? '?' : '';

    // NOTE: we can skip this calculation if optionsShowInitially is false
    const selectedOptions = useMemo(
        () => {
            const selectedValue = options?.find((item) => keySelector(item) === value);
            return isNotDefined(selectedValue) ? [] : [selectedValue];
        },
        [value, options, keySelector],
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

    const handleEnterWithoutOption = useCallback(() => {
        setShowDropdown(false);
        if (onShowDropdownChange) {
            onShowDropdownChange(false);
        }
        setSearchInputValue(undefined);
        if (onSearchValueChange) {
            onSearchValueChange(undefined);
        }
        if (onEnterWithoutOption) {
            onEnterWithoutOption(searchInputValue);
        }
    }, [searchInputValue, onShowDropdownChange, onEnterWithoutOption, onSearchValueChange]);

    const handleChangeDropdown = useCallback(
        (myVal: boolean) => {
            setShowDropdown(myVal);
            if (onShowDropdownChange) {
                onShowDropdownChange(myVal);
            }
            if (myVal) {
                setSelectedKeys(
                    listToMap(
                        value ? [value] : [],
                        (item) => item,
                        () => true,
                    ),
                );
                setFocusedKey(value ? { key: value } : undefined);
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
            const isActive = key === value;

            return {
                label: labelSelector(option),
                description: descriptionSelector
                    ? descriptionSelector(option)
                    : undefined,
                containerClassName: _cs(styles.optionContainer, isActive && styles.active),
                title: labelSelector(option),

                className: styles.option,
                iconClassName: styles.icon,
            };
        },
        [value, labelSelector, descriptionSelector],
    );

    const handleOptionClick = useCallback(
        (k: OPTION_KEY, v: OPTION) => {
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
            onChange(k, name, v);
        },
        [onChange, name, onOptionsChange, keySelector],
    );

    const handleClear = useCallback(
        () => {
            // eslint-disable-next-line react/destructuring-assignment
            if (!props.nonClearable) {
                // eslint-disable-next-line react/destructuring-assignment
                const handleChange = props.onChange;
                handleChange(undefined, name, undefined);
            }
        },
        // eslint-disable-next-line react/destructuring-assignment
        [name, props.onChange, props.nonClearable],
    );

    return (
        <SelectInputContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            name={name}
            options={realOptions}
            optionsPending={optionsPending}
            optionsErrored={optionsErrored}
            optionsFiltered={isTruthyString(searchInputValue) && searchInputValue.length > 0}
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
            hasValue={isDefined(value)}
            persistentOptionPopup={false}
            onEnterWithoutOption={handleEnterWithoutOption}
        />
    );
}

export default SearchSelectInput;
