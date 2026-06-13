import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    children?: React.ReactNode;
    className?: string;
    /** Id wired from the field's `aria-describedby` */
    id?: string;
}

/**
 * Form-field hint text (generic layer). Accepts an `id` so the field's
 * control can reference it via `aria-describedby`.
 */
function InputHint(props: Props) {
    const {
        children,
        className,
        id,
    } = props;

    if (!children) {
        return null;
    }

    return (
        <div
            id={id}
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
