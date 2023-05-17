import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import DefaultCheckmark, { CheckmarkProps } from './Checkmark';

import styles from './styles.module.css';

export interface Props<N> {
  className?: string;
  labelContainerClassName?: string;
  checkmark?: (p: CheckmarkProps) => React.ReactElement;
  checkmarkClassName?: string;
  label?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  indeterminate?: boolean;
  tooltip?: string;
  value: boolean | undefined | null;
  onChange: (value: boolean, name: N) => void;
  name: N;
  invertedLogic?: boolean;
}

function Checkbox<N>(props: Props<N>) {
  const {
    label,
    tooltip,
    checkmark: Checkmark = DefaultCheckmark,
    className: classNameFromProps,
    value,
    disabled,
    readOnly,
    onChange,
    checkmarkClassName,
    labelContainerClassName,
    indeterminate,
    name,
    invertedLogic = false,
    ...otherProps
  } = props;

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const v = e.currentTarget.checked;
      onChange(
        invertedLogic ? !v : v,
        name,
      );
    },
    [name, onChange, invertedLogic],
  );

  const checked = invertedLogic ? !value : value;

  const className = _cs(
    styles.checkbox,
    classNameFromProps,
    indeterminate && styles.indeterminate,
    !indeterminate && checked && styles.checked,
    disabled && styles.disabledCheckbox,
    readOnly && styles.readOnly,
  );


  return (
    <label // eslint-disable-line jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for
      className={className}
      title={tooltip}
    >
      <Checkmark
        className={_cs(checkmarkClassName, styles.checkmark)}
        value={checked ?? false}
        indeterminate={indeterminate}
      />
      <input
        onChange={handleChange}
        className={styles.input}
        type="checkbox"
        checked={checked ?? false}
        disabled={disabled || readOnly}
        {...otherProps}
        readOnly
      />
      <div className={labelContainerClassName}>
        {label}
      </div>
    </label>
  );
}

export default Checkbox;
