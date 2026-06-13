import { _cs } from '@togglecorp/fujs';

import Spinner from '#components/Spinner';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    message?: React.ReactNode;
    /** Use reduced sizing for constrained contexts */
    compact?: boolean;
    /** Drop the default dashed border around the loading area */
    withoutBorder?: boolean;
}

/**
 * BlockLoading is a block-level loading indicator that reserves space
 * for content being fetched.
 * Specific layer: no variants.
 */
function BlockLoading(props: Props) {
    const {
        className,
        message,
        compact,
        withoutBorder = false,
    } = props;

    return (
        <div
            // NOTE: loading status -> polite live region marked busy
            role="status"
            aria-busy
            className={
                _cs(
                    styles.blockLoading,
                    compact && styles.compact,
                    !withoutBorder && styles.withBorder,
                    className,
                )
            }
        >
            <div className={styles.inner}>
                <Spinner className={styles.spinner} />
                {message}
            </div>
        </div>
    );
}

export default BlockLoading;
