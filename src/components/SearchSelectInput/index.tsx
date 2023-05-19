import { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import AsyncSelect, { AsyncProps } from 'react-select/async';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import { GroupBase } from 'react-select';
import { NameType, ValueType } from '#components/types';

import styles from './styles.module.css';

type InheritedProps<O> = Omit<InputContainerProps, 'input'>
  & Omit<AsyncProps<O, false, GroupBase<O>>, 'className' | 'onChange' | 'value' | 'isMulti' | 'name' | 'options' | 'isDisabled' | 'classNames' | 'required' | 'isSearchable'>

type Props<N, O, V extends ValueType> = InheritedProps<O> & {
  inputClassName?: string;
  name: N;
  keySelector: (option: O) => V;
  options: O[];
  value: V | null | undefined;
  onChange: (newValue: V | undefined, name: N) => void;
};

function SearchSelectInput<N extends NameType, O, V extends ValueType>(props: Props<N, O, V>) {
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
        loadOptions,
        name,
        options,
        value,
        keySelector,
        defaultOptions = true,
        ...otherProps
    } = props;

    const handleChange = useCallback((selectedOption: O | null) => {
        if (selectedOption) {
            const value = keySelector(selectedOption);
            onChange(value, name);
        } else {
            onChange(undefined, name);
        }
    }, [onChange, name, keySelector]);

    const readOnlyProps = useMemo(() => (
        readOnly ? {
            isClearable: false,
            isSearchable: false,
            openMenuOnClick: false,
            menuIsOpen: false,
        } : undefined
    ), [readOnly]);

    const selectedValue = useMemo(() => (
        options?.find((option) => keySelector(option) === value)
    ), [options, keySelector, value]);

    return (
        <InputContainer
            className={_cs(
                styles.selectInput,
                className,
            )}
            actions={actions}
            disabled={disabled}
            error={error}
            errorOnTooltip={errorOnTooltip}
            hint={hint}
            icons={icons}
            label={label}
            required={required}
            variant={variant}
            readOnly={readOnly}
            withAsterisk={withAsterisk}
            inputSectionClassName={styles.inputSection}
            input={(
                <AsyncSelect
                    {...otherProps}
                    {...readOnlyProps}
                    cacheOptions
                    options={options}
                    value={selectedValue}
                    loadOptions={loadOptions}
                    classNames={{
                        control: (state) => _cs(styles.control, state.isFocused ? styles.isFocused : undefined),
                        valueContainer: () => styles.valueContainer,
                        indicatorsContainer: () => styles.indicatorContainer,
                        indicatorSeparator: () => styles.indicatorSeparator,
                        dropdownIndicator: () => styles.dropdownIndicator,
                        clearIndicator: () => styles.clearIndicator,
                    }}
                    className={_cs(styles.select, inputClassName)}
                    name={name}
                    isDisabled={disabled}
                    required={required}
                    isMulti={false}
                    onChange={handleChange}
                    defaultOptions={defaultOptions}
                />
            )}
        />
    );
}

export default SearchSelectInput;
