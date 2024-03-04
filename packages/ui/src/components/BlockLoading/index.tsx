import { _cs } from '@togglecorp/fujs';

import Spinner from '#components/Spinner';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    message?: React.ReactNode;
    compact?: boolean;
    withoutBorder?: boolean;
}

function BlockLoading(props: Props) {
    const {
        className,
        message,
        compact,
        withoutBorder = false,
    } = props;

    return (
        <div
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
