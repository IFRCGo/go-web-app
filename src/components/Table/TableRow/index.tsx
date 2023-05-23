import React from 'react';

export type Props = Omit<React.HTMLProps<HTMLTableRowElement>, 'ref'>

function TableRow(props: Props) {
    const {
        className,
        children,
        ...otherProps
    } = props;

    return (
        <tr
            className={className}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        >
            {children}
        </tr>
    );
}

export default TableRow;
