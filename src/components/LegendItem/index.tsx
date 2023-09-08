import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    className?: string;
    label?: React.ReactNode;
    color?: string;
}

function LegendItem(props: Props) {
    const {
        className,
        color,
        label,
    } = props;

    return (
        <div className={_cs(styles.legendElement, className)}>
            <div
                style={{ backgroundColor: color }}
                className={styles.color}
            />
            <div className={styles.label}>
                {label}
            </div>
        </div>
    );
}

export default LegendItem;
