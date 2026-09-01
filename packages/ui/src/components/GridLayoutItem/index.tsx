import {
    HTMLProps,
    useEffect,
    useRef,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './style.module.css';

export interface Props extends Omit<HTMLProps<HTMLDivElement>, 'ref'> {
    rowSpan?: number;
    columnSpan?: number;
}

function GridLayoutItem(props: Props) {
    const {
        rowSpan,
        columnSpan,
        ...otherProps
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.setProperty(
                '--num-row-span',
                String(rowSpan ?? 1),
            );
            containerRef.current.style.setProperty(
                '--num-column-span',
                String(columnSpan ?? 1),
            );
        }
    }, [rowSpan, columnSpan]);

    return (
        <div
            ref={containerRef}
            className={_cs(
                styles.gridLayoutItem,
                isDefined(rowSpan) && styles.rowSpan,
                isDefined(columnSpan) && styles.columnSpan,
            )}
            // style={combinedStyle}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
        />
    );
}

export default GridLayoutItem;
