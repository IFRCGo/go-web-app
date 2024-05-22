import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import InputError from '#components/InputError';
import InputLabel from '#components/InputLabel';
import RawList from '#components/RawList';

import Radio, { Props as RadioProps } from './Radio';

import styles from './styles.module.css';

export interface BaseProps<N, O, V, RRP extends RadioProps<V, N>> {
    className?: string;
    options: O[] | undefined;
    name: N;
    value: V | undefined | null;
    keySelector: (option: O) => V;
    labelSelector: (option: O) => React.ReactNode;
    descriptionSelector?: (option: O) => React.ReactNode;
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    labelContainerClassName?: string;
    hintContainerClassName?: string;
    listContainerClassName?: string;
    disabled?: boolean;
    readOnly?: boolean;
    renderer?: (p: RRP) => React.ReactElement;
    rendererParams?: (o: O) => Omit<RRP, 'inputName' | 'label' | 'name' | 'onClick' | 'value'>;
    clearable?: boolean;
    required?: boolean;
    withAsterisk?: boolean;
}

type NonClearableProps<V, N> = {
    clearable?: false;
    onChange: (value: V, name: N) => void;
}

type ClearableProps<V, N> = {
    clearable: true;
    onChange: (value: V | undefined, name: N) => void;
}

export type Props<N, O, V, RRP extends RadioProps<V, N>, OMISSION extends string> = (
    Omit<BaseProps<N, O, V, RRP>, OMISSION>
    & (
        Omit<ClearableProps<V, N>, OMISSION>
        | Omit<NonClearableProps<V, N>, OMISSION>
    )
)

function isClearable<N, O, V, RRP extends RadioProps<V, N>>(
    props: Props<N, O, V, RRP, never>,
): props is (BaseProps<N, O, V, RRP> & ClearableProps<V, N>) {
    return !!props.clearable;
}

function RadioInput<
    const N,
    O extends object,
    V extends string | number | boolean,
    RRP extends RadioProps<V, N>,
>(props: Props<N, O, V, RRP, never>) {
    const isClearableOptions = isClearable(props);

    const {
        className,
        name,
        options,
        value,
        keySelector,
        labelSelector,
        descriptionSelector,
        label,
        labelContainerClassName,
        hint,
        hintContainerClassName,
        listContainerClassName,
        error,
        renderer = Radio,
        rendererParams: radioRendererParamsFromProps,
        disabled,
        readOnly,
        required,
        onChange,
        withAsterisk,
    } = props;

    const handleRadioClick = React.useCallback((radioKey: V | undefined) => {
        if (readOnly) {
            return;
        }

        if (isClearableOptions) {
            // eslint-disable-next-line react/destructuring-assignment
            props.onChange(radioKey === value ? undefined : radioKey, name);
        }

        if (!isClearableOptions && isDefined(radioKey)) {
            onChange(radioKey, name);
        }
    }, [
        value,
        props,
        onChange,
        isClearableOptions,
        readOnly,
        name,
    ]);

    const rendererParams: (
        k: V,
        i: O,
    ) => RRP = React.useCallback((key: V, item: O) => {
        const radioProps: Pick<RRP, 'inputName' | 'label' | 'name' | 'onClick' | 'value' | 'disabled' | 'readOnly' | 'description'> = {
            inputName: name,
            label: labelSelector(item),
            description: descriptionSelector ? descriptionSelector(item) : undefined,
            name: key,
            onClick: handleRadioClick,
            value: key === value,
            disabled,
            readOnly,
        };

        const combinedProps = {
            ...(radioRendererParamsFromProps ? radioRendererParamsFromProps(item) : undefined),
            ...radioProps,
        } as RRP;

        return combinedProps;
    }, [
        name,
        labelSelector,
        value,
        handleRadioClick,
        radioRendererParamsFromProps,
        disabled,
        readOnly,
        descriptionSelector,
    ]);

    const isRequired = withAsterisk ?? required;

    return (
        <div
            className={_cs(
                styles.radioInput,
                disabled && styles.disabled,
                className,
            )}
        >
            <InputLabel
                className={labelContainerClassName}
                disabled={disabled}
                required={isRequired}
            >
                {label}
            </InputLabel>
            <div className={_cs(styles.radioListContainer, listContainerClassName)}>
                <RawList
                    data={options}
                    rendererParams={rendererParams}
                    renderer={renderer}
                    keySelector={keySelector}
                />
            </div>
            {hint && (
                <div className={_cs(styles.inputHint, hintContainerClassName)}>
                    {hint}
                </div>
            )}
            <InputError>
                {error}
            </InputError>
        </div>
    );
}

export default RadioInput;
