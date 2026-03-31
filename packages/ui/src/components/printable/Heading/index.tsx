import { _cs } from '@togglecorp/fujs';

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
    children?: React.ReactNode;
    level?: HeadingLevel;
}

function Heading(props: Props) {
    const {
        className,
        level = 3,
        children,
    } = props;

    const HeadingEl = `h${level}` as React.ElementType;

    return (
        <HeadingEl className={_cs(styles.heading, levelToClassName[level], className)}>
            {children}
        </HeadingEl>
    );
}

export default Heading;
