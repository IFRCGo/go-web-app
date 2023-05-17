import React from 'react';
import { _cs } from '@togglecorp/fujs';
import styles from './styles.module.css';

interface Props {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

function Header(props: Props) {
  const {
    children,
    className,
    id,
  } = props;
  return (
    <header className={_cs(styles.header, className)} id={id}>
      {children}
    </header>
  );
}

export default Header;
