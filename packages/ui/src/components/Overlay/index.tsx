import type { Ref } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    children?: React.ReactNode;
    className?: string;
    elementRef?: Ref<HTMLDivElement>;
    variant?: 'light' | 'dark';
}

function Overlay(props: Props) {
    const {
        children,
        className,
        elementRef,
        variant = 'light',
    } = props;

    return (
        <div
            ref={elementRef}
            className={_cs(
                className,
                styles.overlay,
                variant === 'dark' && styles.dark,
            )}
        >
            {children}
        </div>
    );
}
export default Overlay;
