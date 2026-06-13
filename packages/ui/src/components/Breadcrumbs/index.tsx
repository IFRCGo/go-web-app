import { Children } from 'react';
import { ChevronRightLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface BreadcrumbsProps {
    className?: string;
    itemClassName?: string;
    separator?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Breadcrumbs renders a `<nav>` trail of crumbs separated by a divider.
 * Specific layer: the last crumb is marked `aria-current="page"` and the
 * separators are `aria-hidden`.
 */
function Breadcrumbs(props: BreadcrumbsProps) {
    const {
        className,
        children,
        separator = <ChevronRightLineIcon />,
        itemClassName,
    } = props;

    const items = Children.toArray(children).reduce<React.ReactNode[]>(
        (acc, child, index, array) => {
            const isLast = index === array.length - 1;
            const item = (
                <div
                    key={`breadcrumb-${index}`} // eslint-disable-line react/no-array-index-key
                    className={_cs(styles.item, itemClassName)}
                    aria-current={isLast ? 'page' : undefined}
                >
                    {child}
                </div>
            );

            acc.push(item);

            if (!isLast) {
                acc.push(
                    <span
                        key={`separator-${index}`} // eslint-disable-line react/no-array-index-key
                        className={styles.separator}
                        aria-hidden
                    >
                        {separator}
                    </span>,
                );
            }

            return acc;
        },
        [],
    );

    return (
        <nav
            className={_cs(styles.breadcrumbs, className)}
            aria-label="breadcrumb"
        >
            {items}
        </nav>
    );
}

export default Breadcrumbs;
