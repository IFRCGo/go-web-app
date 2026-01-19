import { useMemo } from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

export interface Props<VALUE, OPTION> {
    className?: string;
    value: VALUE | undefined;
    options: OPTION[] | undefined;
    keySelector: (datum: OPTION) => VALUE;
    labelSelector: (datum: OPTION) => React.ReactNode;
    label?: React.ReactNode;
    withBackground?: boolean;
}

function SelectOutput<VALUE, OPTION>(props: Props<VALUE, OPTION>) {
    const {
        className,
        value,
        options,
        keySelector,
        labelSelector,
        label,
        withBackground,
    } = props;

    const selectedOption = useMemo(() => options?.find(
        (option) => keySelector(option) === value,
    ), [options, keySelector, value]);

    const valueLabel = useMemo(() => (
        isDefined(selectedOption)
            ? labelSelector(selectedOption)
            : '--'
    ), [labelSelector, selectedOption]);

    return (
        <TextOutput
            className={className}
            label={label}
            value={valueLabel}
            strongLabel
            withBackground={withBackground}
        />
    );
}

export default SelectOutput;
