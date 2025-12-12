import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    isExpanded?: boolean;
    variant?: 'start' | 'end' | 'mid' | 'single';
    disabled?: boolean;
}

function ExpansionIndicator(props: Props) {
    const {
        isExpanded,
        variant,
        disabled,
    } = props;

    if (!isExpanded) {
        return null;
    }

    return (
        <div
            className={_cs(
                styles.expansionIndicator,
                variant === 'start' && styles.start,
                variant === 'end' && styles.end,
                variant === 'single' && styles.single,
                disabled && styles.disabled,
            )}
        >
            <div className={styles.startBorder} />
            <div className={styles.indicator} />
            <div className={styles.endBorder} />
        </div>
    );
}

export default ExpansionIndicator;
