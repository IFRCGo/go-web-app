import React, { forwardRef } from 'react';
import { _cs } from '@togglecorp/fujs';
import styles from './styles.module.css';

interface Props {
  children?: React.ReactNode;
  className?: string;
}

const Overlay = forwardRef<HTMLDivElement, Props>((props, ref) => {
    const {
        children,
        className,
    } = props;
    return (
        <div ref={ref} className={_cs(className, styles.overlay)}>
            {children}
        </div>
    );
});

Overlay.displayName = 'Overlay';
export default Overlay;
