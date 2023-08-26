import { isNotDefined, _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    level: number | null;
    title?: string;
}

function SeverityIndicator(props: Props) {
    const {
        level,
        title,
        className,
    } = props;
    const classNameMap: Record<number, string> = {
        1: styles.yellow,
        2: styles.red,
        3: styles.orange,
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
