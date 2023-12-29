import React from 'react';
import { MoreFillIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import DropdownMenu from '#components/DropdownMenu';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
    extraActions?: React.ReactNode;
    persistent?: boolean;
}

function TableActions(props: Props) {
    const {
        className,
        children,
        extraActions,
        persistent,
    } = props;

    return (
        <div className={_cs(styles.tableActions, className)}>
            {children}
            {extraActions && (
                <DropdownMenu
                    withoutDropdownIcon
                    variant="tertiary"
                    label={<MoreFillIcon className={styles.moreIcon} />}
                    persistent={persistent}
                >
                    {extraActions}
                </DropdownMenu>
            )}
        </div>
    );
}

export default TableActions;
