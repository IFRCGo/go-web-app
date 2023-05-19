import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    children?: React.ReactNode;
    className?: string;
}

function InputHint(props: Props) {
    const {
        children,
        className,
    } = props;

    if (!children) {
        return null;
    }

    return (
        <div
            className={_cs(
                styles.inputHint,
                className,
            )}
        >
            {children}
        </div>
    );
}

export default InputHint;
