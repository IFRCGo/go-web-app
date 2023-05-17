import React from 'react';
import { _cs } from '@togglecorp/fujs';
import styles from './styles.module.css';

interface Props {
  className?: string;
  children: React.ReactNode;
}

function Footer(props: Props) {
    const {
        className,
        children,
    } = props;
    return (
        <footer className={_cs(styles.footer, className)}>
            {children}
        </footer>
    );
}

export default Footer;
