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

function Breadcrumbs(props: BreadcrumbsProps) {
    const {
        className,
        children,
        separator = <ChevronRightLineIcon />,
        itemClassName,
    } = props;

    const items = Children.toArray(children).reduce<React.ReactNode[]>(
        (acc, child, index, array) => {
            const item = (
                <div
                    key={`breadcrumb-${index}`} // eslint-disable-line react/no-array-index-key
                    className={_cs(styles.item, itemClassName)}
                >
                    {child}
                </div>
            );

            acc.push(item);

            if (index !== array.length - 1) {
                acc.push(
                    <span
                        key={`separator-${index}`} // eslint-disable-line react/no-array-index-key
                        className={styles.separator}
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
