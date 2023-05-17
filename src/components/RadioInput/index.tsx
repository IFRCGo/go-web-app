import React from 'react';
import { IoTrash } from 'react-icons/io5';

import { _cs } from '@togglecorp/fujs';
import List from '#components/List';
import InputLabel from '#components/InputLabel';
import InputError from '#components/InputError';
import Radio, { Props as RadioProps } from './Radio';

import styles from './styles.module.css';

export interface Props<N, O, V, RRP extends RadioProps<V, N>> {
  className?: string;
  options: O[];
  name: N;
  value: V | undefined | null;
  onChange: (value: V | undefined, name: N) => void;
  keySelector: (option: O) => V;
  labelSelector: (option: O) => React.ReactNode;
  descriptionSelector?: (option: O) => React.ReactNode;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  labelContainerClassName?: string;
  hintContainerClassName?: string;
  errorContainerClassName?: string;
  listContainerClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  renderer?: (p: RRP) => React.ReactElement;
  rendererParams?: (o: O) => Omit<RRP, 'inputName' | 'label' | 'name' | 'onClick' | 'value'>;
  clearable?: boolean;
}

function RadioInput<
  N,
  O extends object,
  V extends string | number | boolean,
  RRP extends RadioProps<V, N>,
>(props: Props<N, O, V, RRP>) {
  const {
    className,
    name,
    options,
    value,
    onChange,
    keySelector,
    labelSelector,
    descriptionSelector,
    label,
    labelContainerClassName,
    listContainerClassName,
    error,
    errorContainerClassName,
    renderer = Radio,
    rendererParams: radioRendererParamsFromProps,
    disabled,
    readOnly,
    clearable,
  } = props;

  const handleRadioClick = React.useCallback((radioKey: V | undefined) => {
    if (onChange && !readOnly) {
      onChange(radioKey, name);
    }
  }, [readOnly, onChange, name]);

  const rendererParams: (
    k: V,
    i: O,
  ) => RRP = React.useCallback((key: V, item: O) => {
    const radioProps: Pick<RRP, 'inputName' | 'label' | 'name' | 'onClick' | 'value' | 'disabled' | 'readOnly' | 'description'> = {
      inputName: name,
      label: labelSelector(item),
      description: descriptionSelector ? descriptionSelector(item) : undefined,
      name: key,
      onClick: handleRadioClick,
      value: key === value,
      disabled,
      readOnly,
    };

    const combinedProps = {
      ...(radioRendererParamsFromProps ? radioRendererParamsFromProps(item) : undefined),
      ...radioProps,
    } as RRP;

    return combinedProps;
  }, [
    name,
    labelSelector,
    value,
    handleRadioClick,
    radioRendererParamsFromProps,
    disabled,
    readOnly,
    descriptionSelector,
  ]);

  const handleClearButtonClick = React.useCallback(() => {
    if (onChange) {
      onChange(undefined, name);
    }
  }, [name, onChange]);

  return (
    <div
      className={_cs(
        styles.radioInput,
        disabled && styles.disabled,
        className,
      )}
    >
      {clearable && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClearButtonClick}
        >
          <IoTrash />
        </button>
      )}
      <InputLabel
        className={labelContainerClassName}
        disabled={disabled}
      >
        {label}
      </InputLabel>
      <div className={_cs(styles.radioListContainer, listContainerClassName)}>
        <List<O, RadioProps<V, N> & RRP, V, any, any>
          data={options}
          rendererParams={rendererParams}
          renderer={renderer}
          keySelector={keySelector}
        />
      </div>
      <InputError className={errorContainerClassName}>
        {error}
      </InputError>
    </div>
  );
}

export default RadioInput;
