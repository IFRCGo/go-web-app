import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import InlineLayout, { type Props as InlineLayoutProps } from '#components/InlineLayout';
import { type ColorVariant } from '#utils/style';

import styles from './styles.module.css';

export type ButtonColorVariant = ColorVariant;
export type ButtonStyleVariant = 'outline' | 'filled' | 'transparent' | 'action' | 'translucent';
export type ButtonTextSize = 'xs' | 'sm' | 'md' | 'lg';

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

const textSizeToClassName: Record<ButtonTextSize, string> = {
    xs: styles.textSizeExtraSmall,
    sm: styles.textSizeSmall,
    md: styles.textSizeMedium,
    lg: styles.textSizeLarge,
};

export interface Props extends Omit<InlineLayoutProps, 'withPadding' | 'withAdditionalInlinePadding'> {
    className?: string;
    children?: React.ReactNode;
    colorVariant?: ButtonColorVariant;
    styleVariant?: ButtonStyleVariant;
    withoutPadding?: boolean;
    disabled?: boolean;
    withFullWidth?: boolean;
    textSize?: ButtonTextSize;
    withoutAdditionalInlinePadding?: boolean;
}

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
        withoutAdditionalInlinePadding = false,
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
                isDefined(textSize) && textSizeToClassName[textSize],
                readOnly && styles.readOnly,
                className,
            )}
            spacingOffset={spacingOffset}
            withAdditionalInlinePadding={!withoutAdditionalInlinePadding}
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
