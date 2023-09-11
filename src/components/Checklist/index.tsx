import React, { useCallback } from 'react';
import { _cs, isFalsyString } from '@togglecorp/fujs';

import InputLabel from '#components/InputLabel';
import InputError from '#components/InputError';
import InputHint from '#components/InputHint';
import RawList, { type ListKey } from '#components/RawList';
import Checkbox, { Props as CheckboxProps } from '#components/Checkbox';

import styles from './styles.module.css';

export interface Props<
    KEY extends ListKey,
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
    descriptionSelector?: (option: OPTION) => React.ReactNode;
    name: NAME;
    onChange: (newValue: KEY[], name: NAME) => void;
    options: OPTION[] | undefined;
    readOnly?: boolean;
    value: KEY[] | undefined | null;
}

function CheckList<
    KEY extends ListKey,
    const NAME,
    OPTION extends object,
>(props: Props<KEY, NAME, OPTION>) {
    const {
        className,
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
        descriptionSelector,
        checkboxClassName,
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
        description: descriptionSelector ? descriptionSelector(data) : undefined,
        disabled,
        readOnly,
        className: checkboxClassName,
    }), [
        value,
        handleCheck,
        labelSelector,
        descriptionSelector,
        disabled,
        readOnly,
        checkboxClassName,
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
            <div className={_cs(styles.checklistContainer, listContainerClassName)}>
                <RawList<OPTION, KEY, CheckboxProps<KEY>>
                    data={options}
                    keySelector={keySelector}
                    renderer={Checkbox}
                    rendererParams={optionListRendererParams}
                />
            </div>
            <InputError className={errorContainerClassName}>
                {error}
            </InputError>
            {/* FIXME: Do we need to check for error here */}
            {isFalsyString(error) && hint && (
                <InputHint className={hintContainerClassName}>
                    {hint}
                </InputHint>
            )}
        </div>
    );
}

export default CheckList;
