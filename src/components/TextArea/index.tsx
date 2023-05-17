import React from 'react';
import InputContainer, { Props as InputContainerProps } from '../InputContainer';
import RawTextArea, { Props as RawTextAreaProps } from '../RawTextArea';
import { NameType } from '#components/types';

type InheritedProps<N extends NameType> = (Omit<InputContainerProps, 'input'> & Omit<RawTextAreaProps<N>, 'type'>);
export interface Props<T extends string | undefined> extends InheritedProps<T> {
  inputElementRef?: React.RefObject<HTMLInputElement>;
  inputClassName?: string;
}

function TextArea<N extends NameType>(props: Props<N>) {
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
    labelClassName,
    readOnly,
    required,
    variant,
    withAsterisk,
    rows = 5,
    ...otherInputProps
  } = props;

  return (
    <InputContainer
      className={className}
      actions={actions}
      disabled={disabled}
      error={error}
      errorOnTooltip={errorOnTooltip}
      hint={hint}
      icons={icons}
      label={label}
      required={required}
      variant={variant}
      withAsterisk={withAsterisk}
      input={(
        <RawTextArea
          {...otherInputProps}
          readOnly={readOnly}
          disabled={disabled}
          className={inputClassName}
          rows={rows}
        />
      )}
    />
  );
}

export default TextArea;
