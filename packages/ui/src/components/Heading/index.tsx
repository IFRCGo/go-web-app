import {
    ElementType,
    ReactNode,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import useSizeTracking from '#hooks/useSizeTracking';

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
}

function Heading(props: Props) {
    const {
        className,
        level = 3,
        children,
        ellipsize,
    } = props;

    const HeadingTag = `h${level}` as ElementType;
    const headingElementRef = useRef<HTMLHeadingElement>(null);

    const size = useSizeTracking(headingElementRef);

    if (!children) {
        return null;
    }

    return (
        <HeadingTag
            className={_cs(
                styles.heading,
                ellipsize && styles.ellipsized,
                levelToClassName[level],
                className,
            )}
            ref={headingElementRef}
        >
            {ellipsize && (
                <div
                    className={styles.ellipsizedText}
                    style={{
                        width: `${size.width}px`,
                    }}
                    title={typeof children === 'string' ? children : undefined}
                >
                    {children}
                </div>
            )}
            {!ellipsize && children}
        </HeadingTag>
    );
}

export default Heading;
