import type { HTMLProps } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export type Props = Omit<HTMLProps<HTMLTableCellElement>, 'ref'>;

function TableData(props: Props) {
    const {
        className,
        children,
        ...otherProps
    } = props;

    return (
        <td
            className={_cs(className, styles.td)}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            {children}
        </td>
    );
}

export default TableData;
