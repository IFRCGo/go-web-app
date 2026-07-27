import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    className?: string;
}

/**
 * Spinner is a busy/loading indicator (raw layer).
 * It exposes itself as a `role="status"` live region marked `aria-busy`;
 * the animated dots are decorative and `aria-hidden`.
 */
function Spinner(props: Props) {
    const { className } = props;

    return (
        <div
            role="status"
            aria-busy
            className={_cs(styles.spinner, className)}
        >
            <div className={styles.spinnerBounce} aria-hidden />
            <div className={styles.spinnerBounce} aria-hidden />
            <div className={styles.spinnerBounce} aria-hidden />
        </div>
    );
}

export default Spinner;
