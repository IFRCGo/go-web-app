import {
    useCallback,
    useRef,
    useContext,
} from 'react';
import { _cs } from '@togglecorp/fujs';
// TODO: use proper icons
import {
    ArrowUpDownFillIcon,
    ArrowDownFillIcon,
    ArrowUpFillIcon,
} from '@ifrc-go/icons';

import Button from '#components/Button';

import type { BaseHeader, SortDirection } from '../types';
import { SortContext } from '../useSorting';

import styles from './styles.module.css';

export interface HeaderCellProps extends BaseHeader {
    sortable?: boolean;
    defaultSortDirection?: SortDirection;
}

function HeaderCell(props: HeaderCellProps) {
    const {
        className,
        titleClassName,
        title,
        name,

        sortable,
        defaultSortDirection = 'asc',
    } = props;

    const {
        sorting,
        setSorting: onSortChange,
    } = useContext(SortContext);

    const sortDirection = sorting?.name === name
        ? sorting.direction
        : undefined;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleSortClick = useCallback(
        () => {
            if (!onSortChange) {
                return;
            }
            let newSortDirection: SortDirection | undefined;
            if (!sortDirection) {
                newSortDirection = defaultSortDirection;
            } else if (sortDirection === 'asc') {
                newSortDirection = 'dsc';
            } else if (sortDirection === 'dsc') {
                newSortDirection = 'asc';
            }

            if (newSortDirection) {
                onSortChange({ name, direction: newSortDirection });
            } else {
                onSortChange(undefined);
            }
        },
        [name, onSortChange, sortDirection, defaultSortDirection],
    );

    return (
        <div
            ref={containerRef}
            className={_cs(
                className,
                styles.headerCell,
            )}
        >
            {sortable && (
                <Button
                    name={undefined}
                    variant="tertiary"
                    onClick={handleSortClick}
                    title="Sort column"
                    className={styles.sortButton}
                >
                    {!sortDirection && <ArrowUpDownFillIcon />}
                    {sortDirection === 'asc' && <ArrowUpFillIcon />}
                    {sortDirection === 'dsc' && <ArrowDownFillIcon />}
                </Button>
            )}
            <div className={_cs(titleClassName, styles.title)}>
                {title}
            </div>
        </div>
    );
}

export default HeaderCell;
