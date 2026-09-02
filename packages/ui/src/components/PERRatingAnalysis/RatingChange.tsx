import {
    CaretDownLineIcon,
    CaretUpLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface Props {
    value: number;
    direction: 'up' | 'down';
    className?: string;
}

function RatingChange({ value, direction, className }: Props) {
    return (
        <div
            className={_cs(
                styles.ratingChange,
                direction === 'up' ? styles.positive : styles.negative,
                className,
            )}
        >
            {direction === 'up' ? (
                <CaretUpLineIcon className={styles.upIcon} />
            ) : (
                <CaretDownLineIcon className={styles.downIcon} />
            )}
            <span>{Math.abs(value).toFixed(1)}</span>
        </div>
    );
}

export default RatingChange;
