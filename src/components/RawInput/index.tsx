import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { NameType } from '#components/types';

import styles from './styles.module.css';

export interface Props<N extends NameType> extends Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'value' | 'name' | 'label'> {
  className?: string;
  name: N;
  value: string | undefined | null;
  onChange: (
    value: string | undefined,
    name: N,
    e?: React.FormEvent<HTMLInputElement> | undefined,
  ) => void;
  elementRef?: React.Ref<HTMLInputElement>;
}

function RawInput<N extends NameType>(props: Props<N>) {
  const {
    className,
    onChange,
    elementRef,
    value,
    name,
    ...otherProps
  } = props;

  const handleChange = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;

      if (onChange) {
        onChange(
          v === '' ? undefined : v,
          name,
          e,
        );
      }
    }, [name, onChange]);

  return (
    <input
      {...otherProps}
      ref={elementRef}
      className={_cs(
        styles.rawInput,
        className,
      )}
      name={name}
      onChange={handleChange}
      value={value ?? ''}
    />
  );
}

export default RawInput;
