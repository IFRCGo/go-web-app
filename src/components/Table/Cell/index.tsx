import type { ReactNode } from 'react';
import { isNotDefined } from '@togglecorp/fujs';

export interface CellProps<T extends ReactNode>{
    className?: string;
    value: T | null | undefined;
}

function Cell<T extends ReactNode>(props: CellProps<T>) {
    const {
        className,
        value,
    } = props;

    if (isNotDefined(value)) {
        return null;
    }

    return (
        <div className={className}>
            {value}
        </div>
    );
}

export default Cell;
