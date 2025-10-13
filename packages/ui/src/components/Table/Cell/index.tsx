import type { ReactNode } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface CellProps<T extends ReactNode>{
    className?: string;
    value: T | null | undefined;
    withLightText?: boolean;
}

function Cell<T extends ReactNode>(props: CellProps<T>) {
    const {
        className,
        value,
        withLightText,
    } = props;

    if (isNotDefined(value)) {
        return null;
    }

    return (
        <div
            className={_cs(
                styles.cell,
                withLightText && styles.withLightText,
                className,
            )}
        >
            {value}
        </div>
    );
}

export default Cell;
