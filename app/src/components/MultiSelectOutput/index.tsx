import { useMemo } from 'react';
import { DataDisplay } from '@ifrc-go/ui';
import { listToMap } from '@togglecorp/fujs';

interface Props<VALUE, OPTION> {
    className?: string;
    value: VALUE[] | undefined;
    options: OPTION[] | undefined;
    keySelector: (datum: OPTION) => VALUE;
    labelSelector: (datum: OPTION) => React.ReactNode;
    label: React.ReactNode;
    withBackground?: boolean;
}

function MultiSelectOutput<VALUE extends string | number, OPTION>(props: Props<VALUE, OPTION>) {
    const {
        className,
        value,
        options,
        keySelector,
        labelSelector,
        label,
        withBackground,
    } = props;

    const valueMap = useMemo(
        () => listToMap(value ?? [], (val) => val, () => true),
        [value],
    );

    const selectedOptions = useMemo(() => options?.filter(
        (option) => valueMap[keySelector(option)],
    ), [keySelector, options, valueMap]);

    const valueLabel = useMemo(
        () => selectedOptions?.map(
            (selectedOption) => labelSelector(selectedOption),
        ).join(', ') ?? '--',
        [labelSelector, selectedOptions],
    );

    return (
        <DataDisplay
            className={className}
            label={label}
            value={valueLabel}
            strongLabel
            backgroundColor={withBackground ? 'background' : undefined}
        />
    );
}

export default MultiSelectOutput;
