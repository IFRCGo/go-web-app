import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import { NameType, ValueType } from '#components/types';
import InputLabel from '../InputLabel';
import InputError from '../InputError';
import InputHint from '../InputHint';
import List from '../List';
import Checkbox, { Props as CheckboxProps } from '../Checkbox';

import styles from './styles.module.css';

export interface Props<
    T extends ValueType,
    K extends NameType,
    O extends object,
> {
    className?: string;
    checkboxClassName?: string;
    direction?: 'horizontal' | 'vertical';
    disabled?: boolean;
    error?: string;
    errorContainerClassName?: string;
    hint?: React.ReactNode;
    hintContainerClassName?: string;
    keySelector: (option: O) => T;
    label?: React.ReactNode;
    labelContainerClassName?: string;
    labelSelector: (option: O) => string;
    listContainerClassName?: string;
    name: K;
    onChange: (newValue: T[], name: K) => void;
    options: O[] | undefined;
    readOnly?: boolean;
    value: T[] | undefined | null;
}

function CheckList<
    T extends ValueType,
    K extends NameType,
    O extends object,
>(props: Props<T, K, O>) {
    const {
        className,
        checkboxClassName,
        direction = 'horizontal',
        disabled,
        error,
        errorContainerClassName,
        hint,
        hintContainerClassName,
        keySelector,
        label,
        labelContainerClassName,
        labelSelector,
        listContainerClassName,
        name,
        onChange,
        options,
        readOnly,
        value,
    } = props;

    const handleCheck = useCallback((isSelected: boolean, key: T) => {
        if (isSelected) {
            onChange([...(value ?? []), key], name);
        } else {
            onChange([...(value ?? []).filter((v) => v !== key)], name);
        }
    }, [value, onChange, name]);

    const optionListRendererParams = useCallback((key: T, data: O): CheckboxProps<T> => ({
        name: key,
        value: (value ?? []).some((v) => v === key),
        onChange: handleCheck,
        label: labelSelector(data),
        disabled,
        readOnly,
    }), [
        value,
        handleCheck,
        labelSelector,
        disabled,
        readOnly,
    ]);

    return (
        <div
            className={_cs(
                styles.checkListInput,
                className,
                direction === 'horizontal' && styles.horizontal,
                direction === 'vertical' && styles.vertical,
            )}
        >
            <InputLabel
                className={labelContainerClassName}
                disabled={disabled}
            >
                {label}
            </InputLabel>
            <div className={_cs(styles.checkListContainer, listContainerClassName)}>
                <List
                    data={options}
                    keySelector={keySelector}
                    renderer={Checkbox}
                    rendererParams={optionListRendererParams}
                    rendererClassName={checkboxClassName}
                    pending={false}
                    errored={false}
                />
            </div>
            <InputError className={errorContainerClassName}>
                {error}
            </InputError>
            {!error && hint && (
                <InputHint className={hintContainerClassName}>
                    {hint}
                </InputHint>
            )}
        </div>
    );
}

export default CheckList;
