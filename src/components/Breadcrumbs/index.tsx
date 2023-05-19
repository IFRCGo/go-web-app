import { Children } from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoChevronForward } from 'react-icons/io5';

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
        separator = <IoChevronForward />,
        itemClassName,
    } = props;

    const items = Children.toArray(children).reduce<React.ReactNode[]>(
        (acc, child, index, array) => {
            const isLastItem = index === array.length - 1;
            const item = (
                <div
                    key={index}
                    className={_cs(styles.item, itemClassName)}
                    aria-current={isLastItem ? 'page' : false}
                >
                    {child}
                </div>
            );

            acc.push(item);

            if (index !== array.length - 1) {
                acc.push(
                    <span key={`separator-${index}`}>
                        {separator}
                    </span>,
                );
            }

            return acc;
        },
        [],
    );

    return (
        <nav className={_cs(className, styles.breadcrumbs)} aria-label="breadcrumb">
            {items}
        </nav>
    );
}

export default Breadcrumbs;
