import {
    useCallback,
    useEffect,
    useRef,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import InputError from '#components/InputError';
import {
    BackgroundColorType,
    getBackgroundColorClassName,
} from '#utils/style';

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
    /** Surface color token; setting it also adds padding and rounded corners */
    backgroundColor?: BackgroundColorType;
    /**
     * ARIA role for the control input. Switch passes `'switch'` so it is
     * announced as a switch rather than a checkbox.
     */
    role?: React.AriaRole;
    /**
     * Explicit `aria-checked` for the control. Only needed when `role`
     * overrides the native checkbox semantics (e.g. Switch); otherwise
     * the native `checked` attribute conveys the state.
     */
    'aria-checked'?: boolean | 'mixed';
}

/**
 * Checkbox input with label, description and optional custom checkmark
 * (specific layer).
 */
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
        backgroundColor,
        role,
        'aria-checked': ariaChecked,
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

    const inputRef = useRef<HTMLInputElement>(null);
    // `indeterminate` is a DOM property, not an attribute, so React can't set
    // it declaratively — apply it imperatively (and re-apply on checked change,
    // since toggling `checked` clears the indeterminate flag).
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = !!indeterminate;
        }
    }, [indeterminate, checked]);

    const className = _cs(
        styles.checkbox,
        classNameFromProps,
        !indeterminate && checked && styles.checked,
        indeterminate && styles.indeterminate,
        getBackgroundColorClassName(backgroundColor),
        isDefined(backgroundColor) && styles.withBackgroundColor,
        disabled && styles.disabled,
        readOnly && styles.readOnly,
    );

    return (
        <label // eslint-disable-line jsx-a11y/label-has-associated-control
            className={className}
            title={tooltip}
        >
            <div className={_cs(styles.checkmarkContainer, checkmarkContainerClassName)}>
                <input
                    ref={inputRef}
                    onChange={handleChange}
                    className={_cs(styles.input, inputClassName)}
                    type="checkbox"
                    role={role}
                    aria-checked={ariaChecked ?? (indeterminate ? 'mixed' : undefined)}
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
