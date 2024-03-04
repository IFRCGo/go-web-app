import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props<NAME> extends Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'value' | 'name' | 'label'> {
    className?: string;
    name: NAME;
    value: string | undefined | null;
    onChange: (
        value: string | undefined,
        name: NAME,
        e?: React.FormEvent<HTMLInputElement> | undefined,
    ) => void;
    elementRef?: React.Ref<HTMLInputElement>;
}

function RawInput<const N>(props: Props<N>) {
    const {
        className,
        onChange,
        elementRef,
        value,
        name,
        ...otherProps
    } = props;

    const handleChange = React.useCallback((e: React.FormEvent<HTMLInputElement>) => {
        const v = e.currentTarget.value;

        if (onChange) {
            onChange(
                v === '' ? undefined : v,
                name,
                e,
            );
        }
    }, [name, onChange]);

    return (
        <input
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            ref={elementRef}
            className={_cs(
                styles.rawInput,
                className,
            )}
            // FIXME: do we even need to pass name?
            name={isDefined(name) ? String(name) : undefined}
            onChange={handleChange}
            value={value ?? ''}
        />
    );
}

export default RawInput;
