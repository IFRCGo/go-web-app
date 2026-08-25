import {
    ElementType,
    ReactNode,
    useRef,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import useSpacingToken from '#hooks/useSpacingToken';
import {
    ColorVariant,
    paddingSpacings,
    SpacingType,
} from '#utils/style';

import styles from './styles.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const levelToClassName: Record<HeadingLevel, string> = {
    1: styles.levelOne,
    2: styles.levelTwo,
    3: styles.levelThree,
    4: styles.levelFour,
    5: styles.levelFive,
    6: styles.levelSix,
};

const colorVariantToClassName: Record<ColorVariant, string> = {
    text: styles.colorVariantText,
    primary: styles.colorVariantPrimary,
    secondary: styles.colorVariantSecondary,
    success: styles.colorVariantSuccess,
    danger: styles.colorVariantDanger,
    'text-on-dark': styles.colorVariantTextOnDark,
};

export interface Props {
    className?: string;
    level?: HeadingLevel;
    children: ReactNode;
    ellipsize?: boolean;
    centerAligned?: boolean;
    variant?: 'form' | 'container';
    spacing?: SpacingType;
    colorVariant?: ColorVariant;
}

function Heading(props: Props) {
    const {
        className,
        level = 3,
        children,
        ellipsize,
        centerAligned,
        variant = 'container',
        spacing,
        colorVariant,
    } = props;

    const spacingClassName = useSpacingToken({
        spacing,
        modes: paddingSpacings,
    });

    const HeadingTag = `h${level}` as ElementType;
    const headingElementRef = useRef<HTMLHeadingElement>(null);

    if (!children) {
        return null;
    }

    return (
        <HeadingTag
            className={_cs(
                styles.heading,
                ellipsize && styles.ellipsized,
                levelToClassName[level],
                isDefined(colorVariant) && colorVariantToClassName[colorVariant],
                centerAligned && styles.centerAligned,
                variant === 'form' && spacingClassName,
                variant === 'form' && styles.withBottomBorder,
                variant === 'form' && styles.withLightBackground,
                className,
            )}
            ref={headingElementRef}
        >
            {children}
        </HeadingTag>
    );
}

export default Heading;
