import { _cs } from '@togglecorp/fujs';

import InputError from '#components/InputError';
import InputLabel from '#components/InputLabel';
import { type SpacingType } from '#components/types';
import useBasicLayout from '#hooks/useBasicLayout';

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
    spacing?: SpacingType;
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
        spacing,
    } = props;

    const isRequired = withAsterisk ?? required;
    const {
        content: inputSectionContent,
        containerClassName: inputSectionContainerClassName,
    } = useBasicLayout({
        className: _cs(styles.inputSection, inputSectionClassName),
        icons,
        iconsContainerClassName,
        actions,
        actionsContainerClassName,
        children: input,
        childrenContainerClassName: styles.input,
        spacing,
        withoutWrap: true,
        variant: 'xs',
    });

    return (
        <div
            ref={containerRef}
            className={_cs(
                styles.inputContainer,
                !!error && styles.errored,
                readOnly && styles.readOnly,
                variant === 'form' && styles.form,
                variant === 'general' && styles.general,
                disabled && styles.disabled,
                className,
            )}
            title={(errorOnTooltip && !!error && typeof error === 'string')
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
                className={inputSectionContainerClassName}
            >
                {inputSectionContent}
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
