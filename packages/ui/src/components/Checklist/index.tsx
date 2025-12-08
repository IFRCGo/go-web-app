import {
    type ComponentType,
    type ReactNode,
    useCallback,
} from 'react';

import Checkbox, { Props as CheckboxProps } from '#components/Checkbox';
import InputError from '#components/InputError';
import InputHint from '#components/InputHint';
import InputLabel from '#components/InputLabel';
import ListView from '#components/ListView';
import RawList, { type ListKey } from '#components/RawList';
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
    hint?: ReactNode;
    hintContainerClassName?: string;
    keySelector: (option: OPTION) => KEY;
    label?: ReactNode;
    labelContainerClassName?: string;
    labelSelector: (option: OPTION) => string;
    descriptionSelector?: (option: OPTION) => ReactNode;
    name: NAME;
    onChange: (newValue: KEY[], name: NAME) => void;
    options: OPTION[] | undefined;
    readOnly?: boolean;
    value: KEY[] | undefined | null;
    checkListLayout?: 'inline' | 'block' | 'grid';
    checkListLayoutPreferredGridColumns?: number;
    checkListLayoutMinGridColumnSize?: string;
    spacing?: SpacingType;
    withPadding?: boolean;
    withBackground?: boolean;
    withDarkBackground?: boolean;
    renderer?: ComponentType<CheckboxProps<KEY>>
    withoutOpticalSpacingCorrection?: boolean;
}

function CheckList<
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
        hintContainerClassName,
        keySelector,
        label,
        labelContainerClassName,
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
        checkListLayoutMinGridColumnSize,
        spacing,
        withPadding,
        withBackground,
        withDarkBackground,
        renderer = Checkbox<KEY>,
        withoutOpticalSpacingCorrection,
    } = props;

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
            renderer={renderer}
            rendererParams={optionListRendererParams}
        />
    );

    return (
        <ListView
            layout="block"
            className={className}
            withSpacingOpticalCorrection
            spacing={spacing}
            withBackground={withBackground}
            withDarkBackground={withDarkBackground}
            withPadding={withPadding}
        >
            <InputLabel
                className={labelContainerClassName}
                disabled={disabled}
            >
                {label}
            </InputLabel>
            {checkListLayout === 'inline' && (
                <ListView
                    withWrap
                    withSpacingOpticalCorrection={!withoutOpticalSpacingCorrection}
                    spacing={spacing}
                >
                    {checkList}
                </ListView>
            )}
            {checkListLayout === 'block' && (
                <ListView
                    layout="block"
                    withSpacingOpticalCorrection={!withoutOpticalSpacingCorrection}
                    spacing={spacing}
                >
                    {checkList}
                </ListView>
            )}
            {checkListLayout === 'grid' && (
                <ListView
                    layout="grid"
                    numPreferredGridColumns={checkListLayoutPreferredGridColumns}
                    minGridColumnSize={checkListLayoutMinGridColumnSize}
                    withSpacingOpticalCorrection={!withoutOpticalSpacingCorrection}
                    spacing={spacing}
                >
                    {checkList}
                </ListView>
            )}
            {error && (
                <InputError
                    disabled={disabled}
                    floating={errorOnTooltip}
                >
                    {error}
                </InputError>
            )}
            {/* FIXME: Do we need to check for error here? */}
            {!error && !errorOnTooltip && hint && (
                <InputHint className={hintContainerClassName}>
                    {hint}
                </InputHint>
            )}
        </ListView>
    );
}

export default CheckList;
