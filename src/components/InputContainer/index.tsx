import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import InputLabel from '#components/InputLabel';
import InputError from '#components/InputError';

import styles from './styles.module.css';

export interface Props {
    actions?: React.ReactNode;
    actionsContainerClassName?: string;
    errorContainerClassName?: string;
    hintContainerClassName?: string;
    iconsContainerClassName?: string;
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
    containerRef?: React.RefObject<HTMLDivElement>;
    inputSectionRef?: React.RefObject<HTMLDivElement>;
}

function InputContainer(props: Props) {
    const {
        containerRef,
        inputSectionRef,
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
        actionsContainerClassName,
        errorContainerClassName,
        hintContainerClassName,
        iconsContainerClassName,
    } = props;

    const isRequired = withAsterisk ?? required;

    return (
        <div
            ref={containerRef}
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
                : undefined}
        >
            <InputLabel
                className={labelClassName}
                disabled={disabled}
                required={isRequired}
            >
                {label}
            </InputLabel>
            <div
                ref={inputSectionRef}
                className={_cs(
                    styles.inputSection,
                    inputSectionClassName,
                )}
            >
                {icons && (
                    <div className={_cs(styles.iconContainer, iconsContainerClassName)}>
                        {icons}
                    </div>
                )}
                <div className={styles.internalInputContainer}>
                    {input}
                </div>
                {actions && (
                    <div className={_cs(styles.actionContainer, actionsContainerClassName)}>
                        {actions}
                    </div>
                )}
            </div>
            {hint && (
                <div className={_cs(styles.inputHint, hintContainerClassName)}>
                    {hint}
                </div>
            )}
            {!errorOnTooltip && (
                <InputError
                    disabled={disabled}
                    className={_cs(styles.inputError, errorContainerClassName)}
                >
                    {error}
                </InputError>
            )}
        </div>
    );
}

export default InputContainer;
