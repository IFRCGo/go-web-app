import { useCallback } from 'react';
import {
    type CheckboxProps,
    InputError,
} from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

function TimeSpanCheck<const NAME>(props: CheckboxProps<NAME>) {
    const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        checkmarkClassName,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        checkmarkContainerClassName,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        inputClassName,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        labelContainerClassName,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        description,

        className: classNameFromProps,
        disabled,
        error,
        indeterminate,
        invertedLogic = false,
        label,
        name,
        onChange,
        readOnly,
        tooltip,
        value,
        withBackground,
        withDarkBackground,
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
        withDarkBackground && styles.withDarkBackground,
        disabled && styles.disabledCheckbox,
        readOnly && styles.readOnly,
    );

    return (
        <label // eslint-disable-line jsx-a11y/label-has-associated-control
            className={_cs(
                styles.timeSpanCheck,
                value && styles.checked,
                className,
            )}
            title={tooltip}
        >
            <input
                onChange={handleChange}
                className={styles.input}
                type="checkbox"
                checked={checked ?? false}
                disabled={disabled || readOnly}
                readOnly={readOnly}
                {...otherProps} // eslint-disable-line react/jsx-props-no-spreading
            />
            {label}
            {error && (
                <InputError floating>
                    {error}
                </InputError>
            )}
        </label>
    );
}

export default TimeSpanCheck;
