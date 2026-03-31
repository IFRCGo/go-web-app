import { _cs } from '@togglecorp/fujs';

import Description from '#components/Description';
import InlineLayout from '#components/InlineLayout';
import InputError from '#components/InputError';
import InputLabel from '#components/InputLabel';
import ListView from '#components/ListView';
import useSpacingToken from '#hooks/useSpacingToken';
import { SpacingType } from '#utils/style';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    containerRef?: React.RefObject<HTMLDivElement>;
    inputSectionRef?: React.RefObject<HTMLDivElement>;

    label?: React.ReactNode;

    icons?: React.ReactNode;
    input: React.ReactNode;
    actions?: React.ReactNode;

    hint?: React.ReactNode;
    error?: React.ReactNode;
    errorOnTooltip?: boolean;

    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    changed?: boolean;

    variant?: 'form' | 'general' | 'transparent';
    withAsterisk?: boolean;
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
        label,
        readOnly,
        required,
        variant = 'form',
        changed,
        withAsterisk,
        spacing,
    } = props;

    const isRequired = withAsterisk ?? required;
    const paddingClassName = useSpacingToken({
        spacing,
        offset: -3,
        // withAdditionalInlinePadding: true,
        modes: ['padding-inline'],
    });

    return (
        <ListView
            elementRef={containerRef}
            layout="block"
            className={_cs(
                styles.inputContainer,
                !!error && styles.errored,
                readOnly && styles.readOnly,
                variant === 'form' && styles.form,
                variant === 'general' && styles.general,
                disabled && styles.disabled,
                changed && styles.changed,
                className,
            )}
            title={(errorOnTooltip && !!error && typeof error === 'string')
                ? error
                : undefined}
            spacing={spacing}
            spacingOffset={-4}
        >
            <InputLabel
                disabled={disabled}
                required={isRequired}
            >
                {label}
            </InputLabel>
            <InlineLayout
                className={_cs(
                    styles.inputSection,
                    paddingClassName,
                )}
                elementRef={inputSectionRef}
                before={icons}
                after={actions}
                spacingOffset={-3}
                spacing={spacing}
            >
                {input}
            </InlineLayout>
            {!error && !errorOnTooltip && hint && (
                <Description
                    withLightText
                    textSize="sm"
                >
                    {hint}
                </Description>
            )}
            {error && (
                <InputError
                    disabled={disabled}
                    floating={errorOnTooltip}
                >
                    {error}
                </InputError>
            )}
        </ListView>
    );
}

export default InputContainer;
