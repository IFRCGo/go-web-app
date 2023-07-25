import type { ReactNode } from 'react';
import { CheckLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

interface OptionProps {
    className?: string;
    children: ReactNode;
    iconClassName?: string;
    labelClassName?: string;
}

function Option(props: OptionProps) {
    const {
        className,
        children,
        iconClassName,
        labelClassName,
    } = props;

    return (
        <div className={_cs(styles.option, className)}>
            <div className={_cs(styles.icon, iconClassName)}>
                <CheckLineIcon />
            </div>
            <div className={_cs(styles.label, labelClassName)}>
                <div className={styles.overflowContainer}>
                    { children }
                </div>
            </div>
        </div>
    );
}

export default Option;
