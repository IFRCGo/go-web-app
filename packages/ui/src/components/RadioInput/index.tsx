import React, { useMemo } from 'react';
import {
    isNotDefined,
    listToMap,
    OptionKey,
} from '@togglecorp/fujs';

import InputContainer from '#components/InputContainer';
import ListView from '#components/ListView';
import RawList from '#components/RawList';
import { getHighlightMode } from '#utils/common';
import { SpacingType } from '#utils/style';

import Radio, { Props as RadioProps } from './Radio';

export interface CommonProps<NAME, OPTION, VALUE, RADIO_RENDERER_PROPS extends RadioProps<VALUE>> {
    className?: string;
    options: OPTION[] | undefined;
    name: NAME;
    value: VALUE | undefined | null;
    keySelector: (option: OPTION) => VALUE;
    labelSelector: (option: OPTION) => React.ReactNode;
    descriptionSelector?: (option: OPTION) => React.ReactNode;
    label?: React.ReactNode;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    renderer?: (p: RADIO_RENDERER_PROPS) => React.ReactElement;
    rendererParams?: (o: OPTION) => Omit<RADIO_RENDERER_PROPS, 'inputName' | 'label' | 'name' | 'onClick' | 'value'>;
    required?: boolean;
    withAsterisk?: boolean;
    errorOnTooltip?: boolean;
    radioListLayout?: 'inline' | 'block' | 'grid';
    radioListLayoutPreferredGridColumns?: number;
    spacing?: SpacingType;
    withPadding?: boolean;
    withBackground?: boolean;
    withDarkBackground?: boolean;

    prevValue?: VALUE | undefined | null;
    withPrevValue?: boolean;
    withDiffView?: boolean;
}

type ClearableProps<VALUE, NAME> = {
    clearable: true;
    onChange: (value: VALUE | undefined, name: NAME) => void;
}

type NonClearableProps<VALUE, NAME> = {
    clearable?: never;
    onChange: (value: VALUE, name: NAME) => void;
}

export type Props<
NAME,
OPTION,
VALUE,
RADIO_RENDERER_PROPS extends RadioProps<VALUE>
> = CommonProps<NAME, OPTION, VALUE, RADIO_RENDERER_PROPS> & (
    ClearableProps<VALUE, NAME> | NonClearableProps<VALUE, NAME>
)

function RadioInput<
    const NAME,
    OPTION extends object,
    VALUE extends string | number | boolean,
    RADIO_RENDERER_PROPS extends RadioProps<VALUE>,
>(props: Props<NAME, OPTION, VALUE, RADIO_RENDERER_PROPS>) {
    const {
        className,
        name,
        options,
        value,
        keySelector,
        labelSelector,
        descriptionSelector,
        label,
        hint,
        error,
        renderer = Radio,
        rendererParams: radioRendererParamsFromProps,
        disabled,
        readOnly,
        required,
        withAsterisk,
        errorOnTooltip,
        radioListLayout = 'inline',
        radioListLayoutPreferredGridColumns,
        spacing,
        withPadding,
        withBackground,
        withDarkBackground,

        prevValue,
        withDiffView,
        withPrevValue,

        ...otherOptions
    } = props;

    const highlightMode = useMemo(
        () => getHighlightMode(value, prevValue, withDiffView),
        [value, prevValue, withDiffView],
    );

    const prevValueDisplay = useMemo(() => {
        if (!withPrevValue || isNotDefined(prevValue)) {
            return null;
        }

        const labelMap = listToMap(
            options ?? [],
            (option) => keySelector(option) as OptionKey,
            labelSelector,
        );

        return labelMap[prevValue as OptionKey];
    }, [withPrevValue, prevValue, options, keySelector, labelSelector]);

    const handleRadioClick = React.useCallback((radioKey: VALUE | undefined) => {
        if (readOnly || disabled) {
            return;
        }

        if (otherOptions.clearable) {
            otherOptions.onChange(radioKey === value ? undefined : radioKey, name);
        }

        if (isNotDefined(radioKey)) {
            return;
        }

        otherOptions.onChange(radioKey, name);
    }, [readOnly, disabled, otherOptions, name, value]);

    const rendererParams: (
        k: VALUE,
        i: OPTION,
    ) => RADIO_RENDERER_PROPS = React.useCallback((key: VALUE, item: OPTION) => {
        const radioProps: Pick<RADIO_RENDERER_PROPS, 'children' | 'name' | 'onClick' | 'value' | 'disabled' | 'readOnly' | 'description'> = {
            children: labelSelector(item),
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
        } as RADIO_RENDERER_PROPS;

        return combinedProps;
    }, [
        labelSelector,
        value,
        handleRadioClick,
        radioRendererParamsFromProps,
        disabled,
        readOnly,
        descriptionSelector,
    ]);

    const radioList = (
        <RawList
            data={options}
            rendererParams={rendererParams}
            renderer={renderer}
            keySelector={keySelector}
        />
    );

    const spacingOffset = -2;

    return (
        <InputContainer
            className={className}
            withBackground={withBackground}
            withDarkBackground={withDarkBackground}
            withPadding={withPadding}
            disabled={disabled}
            required={required}
            label={label}
            error={error}
            hint={hint}
            highlightMode={highlightMode}
            prevValue={prevValueDisplay}
            withPrevValue={withPrevValue}
            withAsterisk={withAsterisk}
            errorOnTooltip={errorOnTooltip}
            variant="transparent"
            input={(
                <>
                    {radioListLayout === 'inline' && (
                        <ListView
                            withWrap
                            withSpacingOpticalCorrection
                            spacing={spacing}
                            spacingOffset={spacingOffset}
                        >
                            {radioList}
                        </ListView>
                    )}
                    {radioListLayout === 'block' && (
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                            spacing={spacing}
                            spacingOffset={spacingOffset}
                        >
                            {radioList}
                        </ListView>
                    )}
                    {radioListLayout === 'grid' && (
                        <ListView
                            layout="grid"
                            numPreferredGridColumns={radioListLayoutPreferredGridColumns}
                            withSpacingOpticalCorrection
                            spacing={spacing}
                            spacingOffset={spacingOffset}
                        >
                            {radioList}
                        </ListView>
                    )}
                </>
            )}
        />
    );
}

export default RadioInput;
