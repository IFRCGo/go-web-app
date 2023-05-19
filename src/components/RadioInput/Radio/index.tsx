import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    CheckboxBlankCircleLineIcon,
    RadioButtonLineIcon,
} from '@ifrc-go/icons';

import ElementFragments from '#components/ElementFragments';

import styles from './styles.module.css';

export interface Props<N, IN> {
  className?: string;
  inputName?: IN;
  label?: React.ReactNode;
  description?: React.ReactNode;
  name: N;
  onClick: (name: N) => void;
  value: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

function Radio<N, IN>(props: Props<N, IN>) {
    const {
        name,
        label,
        description,
        className,
        value,
        inputName,
        onClick,
        disabled,
        readOnly,
    } = props;

    const handleClick = React.useCallback(() => {
        if (onClick) {
            onClick(name);
        }
    }, [name, onClick]);

    return (
        <label
            className={_cs(
                styles.radio,
                value && styles.active,
                className,
                disabled && styles.disabled,
                readOnly && styles.readOnly,
            )}
        >
            <ElementFragments
                icons={value ? (
                    <RadioButtonLineIcon className={styles.icon} />
                ) : (
                    <CheckboxBlankCircleLineIcon className={styles.icon} />
                )}
                childrenContainerClassName={styles.children}
            >
                {label}
                <div className={styles.description}>
                    {description}
                </div>
            </ElementFragments>
            <input
                className={styles.input}
                type="radio"
                name={typeof inputName === 'string' ? inputName : undefined}
                checked={value}
                onClick={handleClick}
                disabled={disabled}
                readOnly
            />
        </label>
    );
}

export default Radio;
