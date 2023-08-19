import { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import DefaultCheckmark, { CheckmarkProps } from './Checkmark';
import InputError from '../InputError';

import styles from './styles.module.css';

export interface Props<NAME> {
    className?: string;
    checkmark?: (p: CheckmarkProps) => React.ReactElement;
    checkmarkClassName?: string;
    checkmarkContainerClassName?: string;
    errorContainerClassName?: string;
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
}

function Checkbox<const NAME>(props: Props<NAME>) {
    const {
        className: classNameFromProps,
        checkmark: Checkmark = DefaultCheckmark,
        checkmarkClassName,
        checkmarkContainerClassName,
        disabled,
        errorContainerClassName,
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
        disabled && styles.disabledCheckbox,
        readOnly && styles.readOnly,
    );

    return (
        <label // eslint-disable-line jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for
            className={className}
            title={tooltip}
        >
            <div className={_cs(styles.inner, checkmarkContainerClassName)}>
                <Checkmark
                    className={_cs(styles.checkmark, checkmarkClassName)}
                    value={checked ?? false}
                    indeterminate={indeterminate}
                    aria-hidden="true"
                />
                <input
                    onChange={handleChange}
                    className={_cs(styles.input, inputClassName)}
                    type="checkbox"
                    checked={checked ?? false}
                    disabled={disabled || readOnly}
                    readOnly={readOnly}
                    {...otherProps} // eslint-disable-line react/jsx-props-no-spreading
                />
            </div>
            {label && (
                <div className={labelContainerClassName}>
                    {label}
                </div>
            )}
            {error && (
                <InputError className={_cs(styles.inputError, errorContainerClassName)}>
                    {error}
                </InputError>
            )}
        </label>
    );
}

export default Checkbox;
