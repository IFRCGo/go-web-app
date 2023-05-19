import { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { GroupBase } from 'react-select';
import AsyncSelect, { AsyncProps } from 'react-select/async';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import { NameType, ValueType } from '#components/types';

import styles from './styles.module.css';

type InheritedProps<O> = Omit<InputContainerProps, 'input'>
  & Omit<AsyncProps<O, true, GroupBase<O>>, 'className' | 'onChange' | 'value' | 'isMulti' | 'name' | 'options' | 'isDisabled' | 'classNames' | 'required' | 'isSearchable'>

type Props<N, O, V extends ValueType> = InheritedProps<O> & {
  inputClassName?: string;
  name: N;
  options: O[];
  keySelector: (option: O) => V;
  value: V[] | null | undefined;
  onChange: (newValue: V[] | undefined, name: N) => void;
};

function SearchMultiSelectInput<N extends NameType, O, V extends ValueType>(props: Props<N, O, V>) {
    const {
        actions,
        className,
        disabled,
        error,
        errorOnTooltip,
        hint,
        icons,
        inputClassName,
        label,
        readOnly,
        required,
        variant,
        withAsterisk,
        onChange,
        name,
        options,
        value,
        keySelector,
        defaultOptions = true,
        ...otherProps
    } = props;

    const handleChange = useCallback((selectedOptions: readonly O[] | null) => {
        if (selectedOptions) {
            const values = selectedOptions.map((option) => keySelector(option));
            onChange(values, name);
        } else {
            onChange(undefined, name);
        }
    }, [onChange, name, keySelector]);

    const selectedValues = useMemo(() => (
        options?.filter((option) => value?.includes(keySelector(option)))
    ), [options, keySelector, value]);

    const readOnlyProps = useMemo(() => (
        readOnly ? {
            isClearable: false,
            isSearchable: false,
            openMenuOnClick: false,
            menuIsOpen: false,
        } : undefined
    ), [readOnly]);

    return (
        <InputContainer
            className={_cs(
                styles.searchMultiSelectInput,
                className,
            )}
            actions={actions}
            disabled={disabled}
            error={error}
            errorOnTooltip={errorOnTooltip}
            hint={hint}
            icons={icons}
            inputSectionClassName={styles.inputSection}
            label={label}
            readOnly={readOnly}
            required={required}
            variant={variant}
            withAsterisk={withAsterisk}
            input={(
                <AsyncSelect
                    {...otherProps}
                    {...readOnlyProps}
                    value={selectedValues}
                    classNames={{
                        control: (state) => _cs(styles.control, state.isFocused ? styles.isFocused : undefined),
                        valueContainer: () => styles.valueContainer,
                        indicatorsContainer: () => styles.indicatorContainer,
                        indicatorSeparator: () => styles.indicatorSeparator,
                        dropdownIndicator: () => styles.dropdownIndicator,
                        clearIndicator: () => styles.clearIndicator,
                        multiValue: () => styles.multiValue,
                    }}
                    options={options}
                    className={_cs(styles.select, inputClassName)}
                    name={name}
                    isDisabled={disabled}
                    required={required}
                    isMulti
                    onChange={handleChange}
                    defaultOptions={defaultOptions}
                />
            )}
        />
    );
}

export default SearchMultiSelectInput;
