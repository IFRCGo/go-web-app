import React from 'react';
import { _cs } from '@togglecorp/fujs';

import InputLabel from '#components/InputLabel';
import InputError from '#components/InputError';
import List from '#components/List';
import Checkbox from '#components/Checkbox';

import styles from './styles.module.css';

type OptionKey = string | number;

export interface Props<V, O, N> {
  className?: string;
  name: N;
  options: O[];
  onChange: (value: V[] | undefined, name: N) => void;
  value: V[] | undefined | null;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  labelContainerClassName?: string;
  hintContainerClassName?: string;
  errorContainerClassName?: string;
  checkboxListContainerClassName?: string;
  checkboxClassName?: string;
  keySelector: (option: O) => V;
  labelSelector: (option: O) => React.ReactNode;
  tooltipSelector?: (option: O) => string | undefined;
  disabled?: boolean;
  readOnly?: boolean;
}

function Checklist<
  V extends OptionKey,
  O extends object,
  N,
>(props: Props<V, O, N>) {
  const {
    className,
    name,
    options,
    value,
    onChange,
    label,
    keySelector,
    labelSelector,
    labelContainerClassName,
    checkboxListContainerClassName,
    checkboxClassName,
    error,
    errorContainerClassName,
    disabled,
    readOnly,
    tooltipSelector,
  } = props;

  const valueRef = React.useRef<V[]>(value ?? []);

  React.useEffect(() => {
    valueRef.current = value ?? [];
  }, [value]);

  const handleChange = React.useCallback((checked: boolean, key: V) => {
    const i = valueRef.current.findIndex(k => k === key);
    if (i === -1) {
      if (checked) {
        onChange([...valueRef.current, key], name);
      } else {
        // Should never occur
      }
    } else {
      if (checked) {
        // Should never occur
      } else {
        const newValue = [...valueRef.current];
        newValue.splice(i, 1);
        onChange(newValue, name);
      }
    }
  }, [name, onChange]);

  const checkboxRendererParams = React.useCallback((key: V, option: O) => ({
    name: key,
    label: labelSelector(option),
    onChange: handleChange,
    value: value ? value.findIndex(k => k === key) !== -1 : false,
    tooltip: tooltipSelector ? tooltipSelector(option) : undefined,
    className: checkboxClassName,
    disabled: disabled,
  }), [
    value,
    labelSelector,
    handleChange,
    tooltipSelector,
    checkboxClassName,
    disabled
  ]);

  return (
    <div
      className={_cs(
        styles.checklist,
        readOnly && styles.readOnly,
        className,
      )}
    >
      <InputLabel
        className={labelContainerClassName}
        disabled={disabled}
      >
        {label}
      </InputLabel>
      <div className={_cs(styles.checkboxListContainer, checkboxListContainerClassName)}>
        <List
          data={options}
          rendererParams={checkboxRendererParams}
          renderer={Checkbox}
          keySelector={keySelector}
        />
      </div>
      <InputError className={errorContainerClassName}>
        {error}
      </InputError>
    </div>
  );
}

export default Checklist;
