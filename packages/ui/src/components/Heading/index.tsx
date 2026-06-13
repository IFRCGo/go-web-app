import {
    ElementType,
    ReactNode,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    getSpacingClassName,
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

export interface Props {
    className?: string;
    level?: HeadingLevel;
    children: ReactNode;
    ellipsize?: boolean;
    centerAligned?: boolean;
    /** 'form' adds padding, a bottom border and a foreground background */
    styleVariant?: 'form' | 'container';
    spacing?: SpacingType;
}

/**
 * Semantic h1-h6 heading with level-based sizing (generic layer).
 */
function Heading(props: Props) {
    const {
        className,
        level = 3,
        children,
        ellipsize,
        centerAligned,
        styleVariant = 'container',
        spacing,
    } = props;

    const spacingClassName = getSpacingClassName({
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
                centerAligned && styles.centerAligned,
                styleVariant === 'form' && spacingClassName,
                styleVariant === 'form' && styles.withBottomBorder,
                styleVariant === 'form' && styles.withLightBackground,
                className,
            )}
            ref={headingElementRef}
        >
            {children}
        </HeadingTag>
    );
}

export default Heading;
