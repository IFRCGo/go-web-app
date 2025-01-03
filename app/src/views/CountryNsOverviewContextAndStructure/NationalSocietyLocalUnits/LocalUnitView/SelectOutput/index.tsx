import { TextOutput } from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

interface Props<VALUE, OPTION> {
    value: VALUE | undefined;
    options: OPTION[] | undefined;
    keySelector: (datum: OPTION) => VALUE;
    labelSelector: (datum: OPTION) => React.ReactNode;
    label: React.ReactNode;
}

function SelectOutput<VALUE, OPTION>(props: Props<VALUE, OPTION>) {
    const {
        value,
        options,
        keySelector,
        labelSelector,
        label,
    } = props;

    const selectedOption = options?.find(
        (option) => keySelector(option) === value,
    );
    const valueLabel = isDefined(selectedOption) ? labelSelector(selectedOption) : '--';

    return (
        <TextOutput
            label={label}
            value={valueLabel}
            strongLabel
        />
    );
}

export default SelectOutput;
