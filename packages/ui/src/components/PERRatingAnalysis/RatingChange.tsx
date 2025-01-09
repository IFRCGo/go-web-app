import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { CaretUpLineIcon, CaretDownLineIcon } from '@ifrc-go/icons';
import styles from './styles.module.css';

interface Props {
    value: number;
    direction: 'up' | 'down';
    className?: string;
}

function RatingChange({ value, direction, className }: Props) {
    return (
        <div className={_cs(styles.ratingChange, className)}>
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
