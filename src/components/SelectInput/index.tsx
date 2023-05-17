import React, { useCallback, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import Select, { Props as SelectProps, GroupBase } from 'react-select';
import InputContainer, { Props as InputContainerProps } from '#components/InputContainer';
import { NameType, ValueType } from '#components/types';

import styles from './styles.module.css';

type InheritedProps<O> = Omit<InputContainerProps, 'input'>
  & Omit<SelectProps<O, false, GroupBase<O>>, 'className' | 'onChange' | 'value' | 'isMulti' | 'name' | 'options' | 'isDisabled' | 'classNames' | 'required'>

type Props<N, O, V extends ValueType> = InheritedProps<O> & {
  inputClassName?: string;
  name: N;
  options: O[];
  keySelector: (option: O) => V;
  value: V | null | undefined;
  onChange: (newValue: V | undefined, name: N) => void;
};

function SelectInput<N extends NameType, O, V extends ValueType>(props: Props<N, O, V>) {
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

  const selectedValue = useMemo(() => (
    options?.find((option) => keySelector(option) === value) ?? null
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
        <Select
          {...otherProps}
          {...readOnlyProps}
          value={selectedValue}
          classNames={{
            control: (state) => _cs(styles.control, state.isFocused ? styles.isFocused : undefined),
            valueContainer: () => styles.valueContainer,
            indicatorsContainer: () => styles.indicatorContainer,
            indicatorSeparator: () => styles.indicatorSeparator,
            dropdownIndicator: () => styles.dropdownIndicator,
            clearIndicator: () => styles.clearIndicator,
          }}
          options={options}
          className={_cs(styles.select, inputClassName)}
          name={name}
          isDisabled={disabled}
          required={required}
          isMulti={false}
          onChange={handleChange}
        />
      )}
    />
  );
}

export default SelectInput;
