import styles from './styles.module.css';

export interface Props {
    isExpanded?: boolean;
}

function ExpansionIndicator(props: Props) {
    const {
        isExpanded,
    } = props;

    if (!isExpanded) {
        return null;
    }

    return (
        <div className={styles.expansionIndicator}>
            <div className={styles.border} />
            <div className={styles.indicator} />
            <div className={styles.border} />
        </div>
    );
}

export default ExpansionIndicator;
