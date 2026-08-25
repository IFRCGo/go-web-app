import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import { type ColorVariant } from '#utils/style';

import styles from './styles.module.css';

const colorVariantToClassName: Record<ColorVariant, string> = {
    text: styles.colorVariantText,
    primary: styles.colorVariantPrimary,
    secondary: styles.colorVariantSecondary,
    success: styles.colorVariantSuccess,
    danger: styles.colorVariantDanger,
    'text-on-dark': styles.colorVariantTextOnDark,
};

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'ref'> {
    className?: string;
    children?: React.ReactNode;
    withCenteredContent?: boolean;
    elementRef?: React.RefObject<HTMLDivElement | null>;
    textSize?: 'xs' | 'sm' | 'md' | 'lg';
    withLightText?: boolean;
    colorVariant?: ColorVariant;
}

function Description(props: Props) {
    const {
        className,
        children,
        withCenteredContent,
        elementRef,
        textSize = 'md',
        withLightText,
        colorVariant,
        ...otherProps
    } = props;

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            ref={elementRef}
            className={_cs(
                styles.description,
                withCenteredContent && styles.withCenteredContent,
                textSize === 'xs' && styles.textSizeExtraSmall,
                textSize === 'sm' && styles.textSizeSmall,
                textSize === 'md' && styles.textSizeMedium,
                textSize === 'lg' && styles.textSizeLarge,
                isDefined(colorVariant) && colorVariantToClassName[colorVariant],
                withLightText && styles.withLightText,
                className,
            )}
        >
            {children}
        </div>
    );
}

export default Description;
