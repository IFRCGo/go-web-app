import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    level: number | null;
}

function SeverityIndicator(props: Props) {
    const { level } = props;
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
            className={_cs(styles.severityIndicator, classNameMap[level])}
        />
    );
}

export default SeverityIndicator;
