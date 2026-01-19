import React, {
    useCallback,
    useMemo,
} from 'react';
import {
    listToMap,
    OptionKey,
} from '@togglecorp/fujs';

import Checkbox, { Props as CheckboxProps } from '#components/Checkbox';
import InputContainer from '#components/InputContainer';
import ListView from '#components/ListView';
import RawList, { type ListKey } from '#components/RawList';
import { getHighlightMode } from '#utils/common';
import { SpacingType } from '#utils/style';

export interface Props<
    KEY extends ListKey,
    NAME,
    OPTION extends object,
> {
    className?: string;
    checkboxClassName?: string;
    disabled?: boolean;
    error?: string;
    errorOnTooltip?: boolean;
    hint?: React.ReactNode;
    keySelector: (option: OPTION) => KEY;
    label?: React.ReactNode;
    labelSelector: (option: OPTION) => string;
    descriptionSelector?: (option: OPTION) => React.ReactNode;
    name: NAME;
    onChange: (newValue: KEY[], name: NAME) => void;
    options: OPTION[] | undefined;
    readOnly?: boolean;
    value: KEY[] | undefined | null;
    checkListLayout?: 'inline' | 'block' | 'grid';
    checkListLayoutPreferredGridColumns?: number;
    spacing?: SpacingType;
    withPadding?: boolean;
    withBackground?: boolean;
    withDarkBackground?: boolean;

    prevValue?: KEY[] | undefined | null;
    withPrevValue?: boolean;
    withDiffView?: boolean;
    required?: boolean;
}

function Checklist<
    KEY extends ListKey,
    const NAME,
    OPTION extends object,
>(props: Props<KEY, NAME, OPTION>) {
    const {
        className,
        disabled,
        error,
        errorOnTooltip,
        hint,
        keySelector,
        label,
        labelSelector,
        descriptionSelector,
        checkboxClassName,
        name,
        onChange,
        options,
        readOnly,
        value,
        checkListLayout = 'inline',
        checkListLayoutPreferredGridColumns,
        spacing,
        withPadding,
        withBackground,
        withDarkBackground,

        prevValue,
        withDiffView,
        withPrevValue,
        required,
    } = props;

    const highlightMode = useMemo(
        () => getHighlightMode(value, prevValue, withDiffView),
        [value, prevValue, withDiffView],
    );

    const prevValueDisplay = useMemo(() => {
        if (!withPrevValue) {
            return null;
        }

        const labelMap = listToMap(
            options ?? [],
            (option) => keySelector(option) as OptionKey,
            labelSelector,
        );

        return prevValue?.map((item) => (
            labelMap?.[item as OptionKey]
        )).join(', ');
    }, [withPrevValue, prevValue, options, keySelector, labelSelector]);

    const handleCheck = useCallback((isSelected: boolean, key: KEY) => {
        if (isSelected) {
            onChange([...(value ?? []), key], name);
        } else {
            onChange((value ?? []).filter((v) => v !== key), name);
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

    const checkList = (
        <RawList<OPTION, KEY, CheckboxProps<KEY>>
            data={options}
            keySelector={keySelector}
            renderer={Checkbox}
            rendererParams={optionListRendererParams}
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
            errorOnTooltip={errorOnTooltip}
            variant="transparent"
            input={(
                <>
                    {checkListLayout === 'inline' && (
                        <ListView
                            withWrap
                            withSpacingOpticalCorrection
                            spacing={spacing}
                            spacingOffset={spacingOffset}
                        >
                            {checkList}
                        </ListView>
                    )}
                    {checkListLayout === 'block' && (
                        <ListView
                            layout="block"
                            withSpacingOpticalCorrection
                            spacingOffset={spacingOffset}
                            spacing={spacing}
                        >
                            {checkList}
                        </ListView>
                    )}
                    {checkListLayout === 'grid' && (
                        <ListView
                            layout="grid"
                            numPreferredGridColumns={checkListLayoutPreferredGridColumns}
                            withSpacingOpticalCorrection
                            spacingOffset={spacingOffset}
                            spacing={spacing}
                        >
                            {checkList}
                        </ListView>
                    )}
                </>
            )}
        />
    );
}

export default Checklist;
