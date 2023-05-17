import React from 'react';
import {
  _cs,
  isDefined,
} from '@togglecorp/fujs';

import InputLabel from '#components/InputLabel';
import InputError from '#components/InputError';

import styles from './styles.module.css';

export interface Props {
  actions?: React.ReactNode;
  disabled?: boolean;
  error?: React.ReactNode;
  errorOnTooltip?: boolean;
  hint?: React.ReactNode;
  icons?: React.ReactNode;
  input: React.ReactNode;
  inputSectionClassName?: string;
  label?: React.ReactNode;
  labelClassName?: string;
  readOnly?: boolean;
  required?: boolean;
  variant?: 'form' | 'general';
  withAsterisk?: boolean;
  className?: string;
}

function InputContainer(props: Props) {
  const {
    actions,
    className,
    disabled,
    error,
    errorOnTooltip = false,
    hint,
    icons,
    input,
    inputSectionClassName,
    label,
    labelClassName,
    readOnly,
    required,
    variant = 'form',
    withAsterisk,
  } = props;

  const isRequired = withAsterisk ?? required;

  return (
    <div
      className={_cs(
        styles.inputContainer,
        !!error && styles.errored,
        disabled && styles.disabled,
        readOnly && styles.readOnly,
        variant === 'form' && styles.form,
        variant === 'general' && styles.general,
        className,
      )}
      title={(errorOnTooltip && isDefined(error) && typeof error === 'string')
        ? error
        : undefined
      }
    >
      <InputLabel
        className={labelClassName}
        disabled={disabled}
        required={isRequired}
      >
        {label}
      </InputLabel>
      <div className={_cs(
        styles.inputSection,
        inputSectionClassName,
      )}
      >
        {icons && (
          <div className={_cs(styles.iconContainer)}
          >
            {icons}
          </div>
        )}
        <div className={styles.internalInputContainer}
        >
          {input}
        </div>
        {actions && (
          <div className={styles.actionContainer}
          >
            {actions}
          </div>
        )}
      </div>
      {hint && (
        <div className={styles.inputHint}>
          {hint}
        </div>
      )}
      {!errorOnTooltip && (
        <InputError
          disabled={disabled}
          className={styles.inputError}
        >
          {error}
        </InputError>
      )}
    </div>
  );
}

export default InputContainer;
