import { useMemo } from 'react';
import { TextOutput } from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

interface Props<VALUE, OPTION> {
    className?: string;
    value: VALUE | undefined;
    options: OPTION[] | undefined;
    keySelector: (datum: OPTION) => VALUE;
    labelSelector: (datum: OPTION) => React.ReactNode;
    label: React.ReactNode;
}

function SelectOutput<VALUE, OPTION>(props: Props<VALUE, OPTION>) {
    const {
        className,
        value,
        options,
        keySelector,
        labelSelector,
        label,
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
        />
    );
}

export default SelectOutput;
