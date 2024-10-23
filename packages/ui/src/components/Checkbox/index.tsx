import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import InputError from '../InputError';
import DefaultCheckmark, { CheckmarkProps } from './Checkmark';

import styles from './styles.module.css';

// FIXME extend with input prop
export interface Props<NAME> {
    className?: string;
    checkmark?: (p: CheckmarkProps) => React.ReactElement;
    checkmarkClassName?: string;
    checkmarkContainerClassName?: string;
    disabled?: boolean;
    error?: React.ReactNode;
    indeterminate?: boolean;
    inputClassName?: string;
    invertedLogic?: boolean;
    label?: React.ReactNode;
    labelContainerClassName?: string;
    name: NAME;
    onChange: (value: boolean, name: NAME) => void;
    readOnly?: boolean;
    tooltip?: string;
    value: boolean | undefined | null;
    description?: React.ReactNode;
    withBackground?: boolean;
}

function Checkbox<const NAME>(props: Props<NAME>) {
    const {
        className: classNameFromProps,
        checkmark: Checkmark = DefaultCheckmark,
        checkmarkClassName,
        checkmarkContainerClassName,
        disabled,
        error,
        indeterminate,
        inputClassName,
        invertedLogic = false,
        label,
        labelContainerClassName,
        name,
        onChange,
        readOnly,
        tooltip,
        value,
        description,
        withBackground,
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
        !indeterminate && checked && styles.checked,
        withBackground && styles.withBackground,
        disabled && styles.disabledCheckbox,
        readOnly && styles.readOnly,
    );

    return (
        <label // eslint-disable-line jsx-a11y/label-has-associated-control
            className={className}
            title={tooltip}
        >
            <div className={_cs(styles.checkmarkContainer, checkmarkContainerClassName)}>
                <input
                    onChange={handleChange}
                    className={_cs(styles.input, inputClassName)}
                    type="checkbox"
                    checked={checked ?? false}
                    disabled={disabled || readOnly}
                    readOnly={readOnly}
                    {...otherProps} // eslint-disable-line react/jsx-props-no-spreading
                />
                <Checkmark
                    className={_cs(styles.checkmark, checkmarkClassName)}
                    value={checked ?? false}
                    indeterminate={indeterminate}
                    aria-hidden="true"
                />
            </div>
            {(label || description) && (
                <div className={styles.content}>
                    {label && (
                        <div className={labelContainerClassName}>
                            {label}
                        </div>
                    )}
                    {description && (
                        <div className={styles.description}>
                            {description}
                        </div>
                    )}
                </div>
            )}
            {error && (
                <InputError>
                    {error}
                </InputError>
            )}
        </label>
    );
}

export default Checkbox;
