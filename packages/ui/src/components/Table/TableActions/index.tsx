import React from 'react';
import { MoreFillIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import DropdownMenu from '#components/DropdownMenu';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
    /** Additional actions shown inside an overflow ("more") dropdown */
    extraActions?: React.ReactNode;
    /** Keep the dropdown open after an action is clicked */
    persistent?: boolean;
}

/**
 * Specific component for the actions cell of a table row, with an
 * optional overflow dropdown for extra actions.
 */
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
                    labelVariant="tertiary"
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
