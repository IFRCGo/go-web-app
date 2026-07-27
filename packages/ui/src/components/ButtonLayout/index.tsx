import { _cs } from '@togglecorp/fujs';

import InlineLayout, { type Props as InlineLayoutProps } from '#components/InlineLayout';
import {
    getTextSizeClassName,
    type TextSizeType,
} from '#utils/style';

import styles from './styles.module.css';

export type ButtonColorVariant = 'text' | 'text-on-dark' | 'primary' | 'secondary' | 'success' | 'danger';
export type ButtonStyleVariant = 'outline' | 'filled' | 'transparent' | 'action' | 'translucent';
export type ButtonTextSize = Extract<TextSizeType, 'xs' | 'sm' | 'md' | 'lg'>;

const colorVariantToClassName: Record<ButtonColorVariant, string> = {
    text: styles.colorVariantText,
    primary: styles.colorVariantPrimary,
    secondary: styles.colorVariantSecondary,
    success: styles.colorVariantSuccess,
    danger: styles.colorVariantDanger,
    'text-on-dark': styles.colorVariantTextOnDark,
};

const styleVariantToClassName: Record<ButtonStyleVariant, string> = {
    outline: styles.styleVariantOutline,
    filled: styles.styleVariantFilled,
    transparent: styles.styleVariantTransparent,
    translucent: styles.styleVariantTranslucent,
    action: styles.styleVariantAction,
};

export interface Props extends Omit<InlineLayoutProps, 'withPadding'> {
    className?: string;
    children?: React.ReactNode;
    /** Color axis: which semantic color drives outline/background/text */
    colorVariant?: ButtonColorVariant;
    /** Style axis: how the color is applied (filled, outline, etc.) */
    styleVariant?: ButtonStyleVariant;
    /** Removes the default inner padding (padding is on by default) */
    withoutPadding?: boolean;
    disabled?: boolean;
    /** Stretches the layout to fill the parent's width */
    withFullWidth?: boolean;
    /** Font size of the button content, narrowed from the spec text-size scale */
    textSize?: ButtonTextSize;
}

/**
 * Generic layout for button-like elements (generic layer).
 *
 * Renders only the visuals (two-axis colorVariant + styleVariant,
 * spacing, before/after slots) without any button behavior; compose it
 * with RawButton or other interactive primitives. Consumer-facing
 * components (Button, IconButton, ConfirmButton) expose a single curated
 * `variant` prop that maps to these two axes internally.
 */
function ButtonLayout(props: Props) {
    const {
        colorVariant = 'secondary',
        styleVariant = 'translucent',
        spacingOffset,
        className,
        disabled,
        children,
        withoutPadding = false,
        withFullWidth = false,
        textSize,
        readOnly,
        ...inlineLayoutProps
    } = props;

    return (
        <InlineLayout
            withPadding={!withoutPadding}
            className={_cs(
                styles.buttonLayout,
                colorVariantToClassName[colorVariant],
                styleVariantToClassName[styleVariant],
                disabled && styles.disabled,
                withFullWidth && styles.withFullWidth,
                getTextSizeClassName(textSize),
                readOnly && styles.readOnly,
                className,
            )}
            spacingOffset={spacingOffset}
            withAdditionalInlinePadding
            withInlineDisplay
            beforeContainerClassName={styles.before}
            afterContainerClassName={styles.after}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inlineLayoutProps}
        >
            {children}
            <span className={styles.visualFeedback} />
        </InlineLayout>
    );
}

export default ButtonLayout;
