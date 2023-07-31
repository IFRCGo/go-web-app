import React, { useCallback } from 'react';
import { _cs } from '@togglecorp/fujs';

import InputLabel from '#components/InputLabel';
import InputError from '#components/InputError';
import InputHint from '#components/InputHint';
import List from '#components/List';
import type { OptionKey } from '#components/List/common';
import Checkbox, { Props as CheckboxProps } from '#components/Checkbox';

import styles from './styles.module.css';

export interface Props<
    KEY extends OptionKey,
    NAME,
    OPTION extends object,
> {
    className?: string;
    checkboxClassName?: string;
    direction?: 'horizontal' | 'vertical';
    disabled?: boolean;
    error?: string;
    errorContainerClassName?: string;
    hint?: React.ReactNode;
    hintContainerClassName?: string;
    keySelector: (option: OPTION) => KEY;
    label?: React.ReactNode;
    labelContainerClassName?: string;
    labelSelector: (option: OPTION) => string;
    listContainerClassName?: string;
    name: NAME;
    onChange: (newValue: KEY[], name: NAME) => void;
    options: OPTION[] | undefined;
    readOnly?: boolean;
    value: KEY[] | undefined | null;
}

function CheckList<
    KEY extends OptionKey,
    const NAME,
    OPTION extends object,
>(props: Props<KEY, NAME, OPTION>) {
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

    const handleCheck = useCallback((isSelected: boolean, key: KEY) => {
        if (isSelected) {
            onChange([...(value ?? []), key], name);
        } else {
            onChange([...(value ?? []).filter((v) => v !== key)], name);
        }
    }, [value, onChange, name]);

    const optionListRendererParams = useCallback((key: KEY, data: OPTION): CheckboxProps<KEY> => ({
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
                styles.checklist,
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
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <List<OPTION, CheckboxProps<KEY>, KEY, any, any>
                className={_cs(styles.checkListContainer, listContainerClassName)}
                data={options}
                keySelector={keySelector}
                renderer={Checkbox}
                rendererParams={optionListRendererParams}
                rendererClassName={checkboxClassName}
                pending={false}
                errored={false}
                filtered={false}
            />
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
