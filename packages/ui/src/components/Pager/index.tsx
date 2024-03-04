import {
    ChevronLeftLineIcon,
    ChevronRightLineIcon,
} from '@ifrc-go/icons';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

import RawButton from '#components/RawButton';
import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

function range(start: number, end: number) {
    const foo: number[] = [];
    for (let i = start; i <= end; i += 1) {
        foo.push(i);
    }
    return foo;
}

class Side {
    public capacity: number;

    public demand: number;

    public excess: number;

    constructor(capacity: number, demand: number) {
        this.capacity = capacity;
        this.demand = demand;
        this.excess = this.capacity - this.demand;
    }

    hasShortage() {
        return this.excess < 0;
    }

    increaseCapacity(inc: number) {
        this.capacity += inc;
        this.excess += inc;
    }

    decreaseCapacity(dec: number) {
        this.capacity += dec;
        this.excess += dec;
    }

    optimizeCapacity() {
        if (this.excess > 0) {
            this.capacity -= this.excess;
            this.excess = 0;
        }
    }
}

type PaginationItem = {
    type: 'button';
    index: number;
} | {
    type: 'span';
    key: string;
    label: string;
} | {
    type: 'fakeButton';
    key: string;
    label: string;
};

function applyPagination(
    totalCapacity: number,
    active: number,
    total: number,
    showAllPages = false,
) {
    if (showAllPages) {
        return range(1, total).map((index): PaginationItem => {
            if (index === active) {
                return { type: 'fakeButton', label: String(active), key: 'active' };
            }
            return { type: 'button', index };
        });
    }

    const oneSideCapacity = (totalCapacity - 1) / 2;
    const startIndex = 1;
    const lastIndex = total;

    // Once upon a time, there were two sides of a town
    // And every year, each got equal amount of ration
    // But, they had a variable demand, and each year it could change
    const right = new Side(oneSideCapacity, active - startIndex);
    const left = new Side(oneSideCapacity, lastIndex - active);

    // So the two sides made a treaty
    // If any of the side had an excess that year and the other side had a shortage,
    // they had to give the excess to the other side
    // That way, all the ration would be used
    const leftExcess = left.excess;
    const rightExcess = right.excess;
    if (right.hasShortage() && leftExcess > 0) {
        right.increaseCapacity(leftExcess);
    } else if (left.hasShortage() && right.excess > 0) {
        left.increaseCapacity(rightExcess);
    }

    left.optimizeCapacity();
    right.optimizeCapacity();

    const lst: PaginationItem[] = [];

    if (right.capacity > 0) {
        if (right.excess >= 0) {
            lst.push(
                ...range(startIndex, active - 1).map((i) => ({ type: 'button' as const, index: i })),
            );
        } else {
            lst.push(
                { type: 'button', index: startIndex },
                { type: 'span', label: '…', key: 'startTick' },
                ...range(active - (right.capacity - 2), active - 1).map((i) => ({ type: 'button' as const, index: i })),
            );
        }
    }

    lst.push(
        { type: 'fakeButton', label: String(active), key: 'active' },
    );

    if (left.capacity > 0) {
        if (left.excess >= 0) {
            lst.push(
                ...range(active + 1, lastIndex).map((i) => ({ type: 'button' as const, index: i })),
            );
        } else {
            lst.push(
                ...range(active + 1, active + (left.capacity - 2)).map((i) => ({ type: 'button' as const, index: i })),
                { type: 'span', label: '...', key: 'endTick' },
                { type: 'button', index: lastIndex },
            );
        }
    }

    return lst;
}

export type Props = {
    activePage: number;
    className?: string;
    disabled?: boolean;
    itemsCount: number;
    maxItemsPerPage: number;
    onActivePageChange: (pageNumber: number) => void;
    showAllPages?: boolean;
    totalCapacity?: number;
}

function Pager(props: Props) {
    const {
        activePage: activePageProps,
        className,
        disabled = false,
        itemsCount,
        maxItemsPerPage = 25,
        onActivePageChange,
        showAllPages = false,
        totalCapacity = 7,
    } = props;

    const strings = useTranslation(i18n);

    // NOTE: activePage can never be 0
    const activePage = Math.max(activePageProps, 1);
    // NOTE: number of pages can never be 0
    const numPages = Math.max(Math.ceil(itemsCount / maxItemsPerPage), 1);

    const pages = applyPagination(totalCapacity, activePage, numPages, showAllPages);

    const pageList = pages.length > 1 ? (
        <div className={styles.pageList}>
            <RawButton
                name={activePage - 1}
                onClick={onActivePageChange}
                className={styles.pageButton}
                disabled={activePage <= 1 || disabled}
                title={`${strings.rawButtonGoToPage} ${activePage - 1}`}
            >
                <ChevronLeftLineIcon className={styles.icon} />
            </RawButton>
            {pages.map((page) => {
                if (page.type === 'button') {
                    return (
                        <RawButton
                            className={styles.pageButton}
                            key={`button-${page.index}`}
                            name={page.index}
                            onClick={onActivePageChange}
                            disabled={disabled}
                            title={`${strings.rawButtonGoTo} ${page.index}`}
                        >
                            {page.index}
                        </RawButton>
                    );
                }
                if (page.type === 'fakeButton') {
                    return (
                        <RawButton
                            key={`button-${page.key}`}
                            name={undefined}
                            className={_cs(
                                styles.pageButton,
                                styles.active,
                                page.label.length > 2 && styles.compact,
                            )}
                        >
                            {page.label}
                        </RawButton>
                    );
                }
                return (
                    <div
                        key={`span-${page.key}`}
                        className={styles.pageButton}
                    >
                        {page.label}
                    </div>
                );
            })}
            <RawButton
                name={activePage + 1}
                onClick={onActivePageChange}
                disabled={activePage >= numPages || disabled}
                className={styles.pageButton}
                title={`${strings.rawButtonGoToPage} ${activePage - 1}`}
            >
                <ChevronRightLineIcon className={styles.icon} />
            </RawButton>
        </div>
    ) : undefined;

    if (isNotDefined(pageList)) {
        return null;
    }

    return (
        <div className={_cs(className, styles.pager)}>
            {pageList}
        </div>
    );
}
export default Pager;
