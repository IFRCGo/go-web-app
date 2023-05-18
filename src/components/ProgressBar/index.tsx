import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    barHeight?: number;
    title?: React.ReactNode;
    description?: React.ReactNode;
    value: number;
    totalValue: number;
    color?: string;
}

function ProgressBar(props: Props) {
    const {
        className,
        title,
        description,
        totalValue,
        value,
        color,
        barHeight = 8,
    } = props;

    return (
        <div className={_cs(styles.progressWrapper, className)}>
            <div className={styles.title}>
                {title}
            </div>
            <div
                className={styles.total}
                style={{ height: `${barHeight}px` }}
            >
                <div
                    className={styles.progress}
                    style={{
                        width: `${(value / totalValue) * 100}%`,
                        backgroundColor: color ?? '#011E41',
                    }}
                />
            </div>
            <div className={styles.description}>
                {description}
            </div>
        </div>
    );
}

export default ProgressBar;
