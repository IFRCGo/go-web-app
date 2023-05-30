import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoEllipsisHorizontal } from 'react-icons/io5';

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
          hideDropdownIcon
          variant='tertiary'
          label={<IoEllipsisHorizontal />}
        >
          {extraActions}
        </DropdownMenu>
      )}
    </div>
  );
}

export default TableActions;
