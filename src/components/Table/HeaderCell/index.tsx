import {
    useCallback,
    useRef,
    useContext,
} from 'react';
import { isNotDefined, _cs } from '@togglecorp/fujs';
import {
    ArrowDropDownLineIcon,
    ArrowDropUpLineIcon,
    TableSortingLineIcon,
} from '@ifrc-go/icons';

import Button from '#components/Button';
import InfoPopup from '#components/InfoPopup';

import type { BaseHeader, SortDirection } from '../types';
import { SortContext } from '../useSorting';

import styles from './styles.module.css';

export interface HeaderCellProps extends BaseHeader {
    sortable?: boolean;
    defaultSortDirection?: SortDirection;
    infoTitle?: React.ReactNode;
    infoDescription?: React.ReactNode;
}

function HeaderCell(props: HeaderCellProps) {
    const {
        className,
        titleClassName,
        title,
        name,

        sortable,
        defaultSortDirection = 'asc',
        infoTitle,
        infoDescription,
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
            if (isNotDefined(onSortChange)) {
                return;
            }
            let newSortDirection: SortDirection | undefined;
            if (isNotDefined(sortDirection)) {
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
                    {isNotDefined(sortDirection)
                        && <TableSortingLineIcon className={styles.icon} />}
                    {sortDirection === 'asc' && <ArrowDropUpLineIcon className={styles.icon} />}
                    {sortDirection === 'dsc' && <ArrowDropDownLineIcon className={styles.icon} />}
                </Button>
            )}
            <div className={_cs(titleClassName, styles.title)}>
                {title}
            </div>
            {infoTitle && infoDescription && (
                <InfoPopup
                    title={infoTitle}
                    description={infoDescription}
                />
            )}
        </div>
    );
}

export default HeaderCell;
