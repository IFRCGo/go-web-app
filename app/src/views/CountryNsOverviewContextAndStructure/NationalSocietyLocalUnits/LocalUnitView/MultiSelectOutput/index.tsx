import { TextOutput } from '@ifrc-go/ui';
import { listToMap } from '@togglecorp/fujs';

interface Props<VALUE, OPTION> {
    value: VALUE[] | undefined;
    options: OPTION[] | undefined;
    keySelector: (datum: OPTION) => VALUE;
    labelSelector: (datum: OPTION) => React.ReactNode;
    label: React.ReactNode;
}

function MultiSelectOutput<VALUE extends string | number, OPTION>(props: Props<VALUE, OPTION>) {
    const {
        value,
        options,
        keySelector,
        labelSelector,
        label,
    } = props;

    const valueMap = listToMap(value ?? [], (val) => val, () => true);

    const selectedOptions = options?.filter(
        (option) => valueMap[keySelector(option)],
    );

    const valueLabel = selectedOptions?.map(
        (selectedOption) => labelSelector(selectedOption),
    ).join(', ') ?? '--';

    return (
        <TextOutput
            label={label}
            value={valueLabel}
            strongLabel
        />
    );
}

export default MultiSelectOutput;
