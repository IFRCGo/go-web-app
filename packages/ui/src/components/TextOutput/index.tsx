import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import RawOutput, { Props as RawOutputProps } from '#components/RawOutput';
import { DEFAULT_INVALID_TEXT } from '#utils/constants';
import {
    BackgroundColorType,
    fullSpacings,
    gapSpacings,
    getBackgroundColorClassName,
    getBorderRadiusClassName,
    getSpacingClassName,
    getTextSizeClassName,
    SpacingType,
    TextSizeType,
} from '#utils/style';

import styles from './styles.module.css';

interface BaseProps {
    className?: string;
    icon?: React.ReactNode;
    label?: React.ReactNode;
    description?: React.ReactNode;
    labelClassName?: string;
    descriptionClassName?: string;
    valueClassName?: string;
    strongValue?: boolean;
    strongLabel?: boolean;
    strongDescription?: boolean;
    /** Suppresses the ':' appended after the label by default */
    withoutLabelColon?: boolean;
    /**
     * Surface color token; setting it also pads the row and rounds
     * its corners ('md')
     */
    backgroundColor?: BackgroundColorType;
    /** Font size token applied to the whole row */
    textSize?: TextSizeType;
    /** Stacks label, value and description vertically */
    withBlockLayout?: boolean;
    spacing?: SpacingType;
    withUppercaseLetters?: boolean;
    withLightText?: boolean;
}

export type Props = BaseProps & RawOutputProps;

/**
 * Labelled value row: icon, label, typed value and description
 * (specific layer).
 *
 * Value rendering is delegated to RawOutput, so the `valueType`
 * discriminated union (boolean/number/date/text or a plain node)
 * and the per-type props come from RawOutputProps.
 */
function TextOutput(props: Props) {
    const {
        className,
        label,
        icon,
        description,
        labelClassName,
        descriptionClassName,
        valueClassName,
        strongLabel,
        strongValue,
        strongDescription,
        withoutLabelColon,
        backgroundColor,
        invalidText = DEFAULT_INVALID_TEXT,
        textSize,
        withBlockLayout,
        spacing,
        withUppercaseLetters,
        withLightText,
        ...rawOutputProps
    } = props;

    const spacingClassName = getSpacingClassName({
        spacing,
        offset: -2,
        modes: isDefined(backgroundColor)
            ? fullSpacings
            : gapSpacings,
    });

    return (
        <div
            className={_cs(
                styles.textOutput,
                getBackgroundColorClassName(backgroundColor),
                isDefined(backgroundColor) && getBorderRadiusClassName('md'),
                getTextSizeClassName(textSize),
                withBlockLayout && styles.withBlockLayout,
                withUppercaseLetters && styles.withUppercaseLetters,
                withLightText && styles.withLightText,
                spacingClassName,
                className,
            )}
        >
            {icon}
            {label && (
                <div
                    className={_cs(
                        styles.label,
                        strongLabel && styles.strong,
                        labelClassName,
                        !withoutLabelColon && styles.withColon,
                    )}
                >
                    {label}
                </div>
            )}
            <div
                className={_cs(
                    styles.value,
                    strongValue && styles.strong,
                    rawOutputProps.valueType === 'text' && styles.textType,
                    valueClassName,
                )}
            >
                <RawOutput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...rawOutputProps}
                    invalidText={invalidText}
                />
            </div>
            {description && (
                <div
                    className={_cs(
                        styles.description,
                        strongDescription && styles.strong,
                        descriptionClassName,
                    )}
                >
                    {description}
                </div>
            )}
        </div>
    );
}

export default TextOutput;
