import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { MoreFillIcon } from '@ifrc-go/icons';

import DropdownMenu from '#components/DropdownMenu';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
    extraActions?: React.ReactNode;
}

function TableActions(props: Props) {
    const {
        className,
        children,
        extraActions,
    } = props;

    return (
        <div className={_cs(styles.tableActions, className)}>
            {children}
            {extraActions && (
                <DropdownMenu
                    withoutDropdownIcon
                    variant="tertiary"
                    label={<MoreFillIcon className={styles.moreIcon} />}
                >
                    {extraActions}
                </DropdownMenu>
            )}
        </div>
    );
}

export default TableActions;
