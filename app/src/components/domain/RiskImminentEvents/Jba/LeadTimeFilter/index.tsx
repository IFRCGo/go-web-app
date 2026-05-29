import { useMemo } from 'react';
import { RadioInput } from '@ifrc-go/ui';

import { JBA_LEAD_TIME_DAYS } from '../../malawi/constants';

interface Option {
    key: number;
    label: string;
}

function keySelector(o: Option) { return o.key; }
function labelSelector(o: Option) { return o.label; }

interface Props {
    value: number;
    onChange: (value: number) => void;
}

function LeadTimeFilter(props: Props) {
    const { value, onChange } = props;

    const options = useMemo<Option[]>(
        () => JBA_LEAD_TIME_DAYS.map((d) => ({
            key: d,
            label: `${d} day${d === 1 ? '' : 's'}`,
        })),
        [],
    );

    return (
        <RadioInput
            // FIXME: use strings
            label="Forecast lead time"
            name="leadTimeDays"
            value={value}
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onChange={onChange}
            radioListLayout="inline"
            spacing="xs"
        />
    );
}

export default LeadTimeFilter;
