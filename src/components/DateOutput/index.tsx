import { useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import { formatDate } from '#utils/common';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    value?: string | number | null;
    format?: string;
    invalidText?: React.ReactNode;
}

function DateOutput(props: Props) {
    const {
        value,
        format = 'yyyy-MM-dd',
        className,
        invalidText,
    } = props;

    const formattedDate = useMemo(
        () => formatDate(
            value,
            format,
        ),
        [value, format],
    );

    return (
        <div className={_cs(styles.dateOutput, className)}>
            {formattedDate ?? invalidText}
        </div>
    );
}

export default DateOutput;
