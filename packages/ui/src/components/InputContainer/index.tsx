import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import Description from '#components/Description';
import InlineLayout from '#components/InlineLayout';
import InputError from '#components/InputError';
import InputLabel from '#components/InputLabel';
import Label from '#components/Label';
import ListView from '#components/ListView';
import {
    BackgroundColorType,
    getSpacingClassName,
    SpacingType,
} from '#utils/style';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** Ref to the root DOM node */
    elementRef?: React.RefObject<HTMLDivElement | null>;
    /** Ref to the inner input section node (icons + input + actions row) */
    inputSectionRef?: React.RefObject<HTMLDivElement | null>;

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

    highlightMode?: 'add' | 'update' | 'remove';
    prevValue?: React.ReactNode;
    withPrevValue?: boolean;

    /**
     * 'form' shows an input well, 'general' only a bottom border,
     * 'transparent' no input section decoration
     */
    styleVariant?: 'form' | 'general' | 'transparent';
    withAsterisk?: boolean;
    spacing?: SpacingType;

    withPadding?: boolean;
    /** Surface color token for the container root */
    backgroundColor?: BackgroundColorType;
    withoutInputSectionPadding?: boolean;
}

/**
 * Layout shell shared by the input components: label, input section
 * (icons + input + actions), hint, error and diff highlight (generic layer).
 */
function InputContainer(props: Props) {
    const {
        elementRef,
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
        styleVariant = 'form',
        withAsterisk,
        spacing,
        prevValue,
        withPrevValue,
        highlightMode,
        withPadding,
        backgroundColor,
        withoutInputSectionPadding,
    } = props;

    const isRequired = withAsterisk ?? required;
    const paddingClassName = getSpacingClassName({
        spacing,
        offset: styleVariant === 'transparent' ? -2 : -3,
        modes: withoutInputSectionPadding ? [] : ['padding-inline'],
    });

    return (
        <ListView
            elementRef={elementRef}
            layout="block"
            className={_cs(
                styles.inputContainer,
                !!error && styles.errored,
                readOnly && styles.readOnly,
                styleVariant === 'form' && styles.formVariant,
                styleVariant === 'general' && styles.generalVariant,
                styleVariant === 'transparent' && styles.transparentVariant,
                disabled && styles.disabled,
                highlightMode === 'add' && styles.withAddHighlight,
                highlightMode === 'update' && styles.withUpdateHighlight,
                highlightMode === 'remove' && styles.withRemoveHighlight,
                className,
            )}
            title={(errorOnTooltip && !!error && typeof error === 'string')
                ? error
                : undefined}
            spacing={spacing}
            spacingOffset={-4}
            backgroundColor={backgroundColor}
            withPadding={withPadding}
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
            {withPrevValue && prevValue && isDefined(highlightMode) && (
                <Label strong>
                    {prevValue}
                </Label>
            )}
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
