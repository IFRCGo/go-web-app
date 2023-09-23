import React from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    CheckboxBlankCircleLineIcon,
    RadioButtonLineIcon,
} from '@ifrc-go/icons';

import useBasicLayout from '#hooks/useBasicLayout';

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

    const {
        content,
        containerClassName,
    } = useBasicLayout({
        icons: value ? (
            <RadioButtonLineIcon className={styles.icon} />
        ) : (
            <CheckboxBlankCircleLineIcon className={styles.icon} />
        ),
        childrenContainerClassName: styles.content,
        children: (
            <>
                {label}
                {description && (
                    <div className={styles.description}>
                        {description}
                    </div>
                )}
            </>
        ),
        spacing: 'compact',
        withoutWrap: true,
    });

    return (
        // eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for
        <label
            className={_cs(
                styles.radio,
                value && styles.active,
                disabled && styles.disabled,
                readOnly && styles.readOnly,
                containerClassName,
                className,
            )}
        >
            <input
                className={styles.input}
                type="radio"
                name={typeof inputName === 'string' ? inputName : undefined}
                checked={value}
                onClick={handleClick}
                disabled={disabled}
                readOnly
            />
            {content}
        </label>
    );
}

export default Radio;
