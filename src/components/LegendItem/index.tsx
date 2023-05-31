import styles from './styles.module.css';

interface Props {
    label?: React.ReactNode;
    color?: string;
}

function LegendItem(props: Props) {
    const {
        color,
        label,
    } = props;

    return (
        <div className={styles.legendElement}>
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
