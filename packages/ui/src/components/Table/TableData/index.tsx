import type { HTMLProps } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface TableDataAdditionalProps {
    expandedContentCell?: boolean;
    withoutBorder?: boolean;
}

export type Props = Omit<HTMLProps<HTMLTableCellElement>, 'ref'> & TableDataAdditionalProps;

function TableData(props: Props) {
    const {
        className,
        children,
        expandedContentCell,
        withoutBorder,
        ...otherProps
    } = props;

    return (
        <td
            className={_cs(
                styles.tableData,
                expandedContentCell && styles.expandedContentCell,
                withoutBorder && styles.withoutBorder,
                className,
            )}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            {children}
        </td>
    );
}

export default TableData;
