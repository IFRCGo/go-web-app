import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    level: number | undefined | null;
    title?: string;
}

function SeverityIndicator(props: Props) {
    const {
        level,
        title,
        className,
    } = props;
    const classNameMap: Record<number, string> = {
        0: styles.yellow,
        1: styles.orange,
        2: styles.red,
    };

    if (isNotDefined(level)) {
        return null;
    }

    return (
        <div
            title={title}
            className={_cs(styles.severityIndicator, className)}
        >
            <div className={_cs(styles.icon, classNameMap[level])} />
        </div>
    );
}

export default SeverityIndicator;
