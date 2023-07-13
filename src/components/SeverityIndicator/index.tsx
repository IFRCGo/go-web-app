import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    level: number | null;
    title?: string;
}

function SeverityIndicator(props: Props) {
    const {
        level,
        title,
    } = props;
    const classNameMap: Record<number, string> = {
        1: styles.yellow,
        2: styles.red,
        3: styles.orange,
    };

    if (!level) {
        return null;
    }

    return (
        <span
            title={title}
            className={_cs(styles.severityIndicator, classNameMap[level])}
        />
    );
}

export default SeverityIndicator;
