import { useMemo } from 'react';
import {
    Checklist,
    SelectInput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import i18n from './i18n.json';

type Timeframe = 'hours' | 'days' | 'months' | 'years';

type TimeframeOptions = {
    key: Timeframe,
    value: string,
}

type TimespanOptions = {
    key: number,
    value: string,
}

const timeframeOptions: TimeframeOptions[] = [
    {
        key: 'hours',
        value: 'Hours',
    },
    {
        key: 'days',
        value: 'Days',
    },
    {
        key: 'months',
        value: 'Months',
    },
    {
        key: 'years',
        value: 'Years',
    },
];

function createTimespanOptions(range: number[]): TimespanOptions[] {
    return range.map((num) => ({
        key: num,
        value: String(num),
    }));
}

const timespanOptionsMap: Record<Timeframe, TimespanOptions[]> = {
    hours: createTimespanOptions(Array.from({ length: 25 }, (_, i) => i)),
    days: createTimespanOptions(Array.from({ length: 31 }, (_, i) => i + 1)),
    months: createTimespanOptions(Array.from({ length: 12 }, (_, i) => i + 1)),
    years: createTimespanOptions(Array.from({ length: 10 }, (_, i) => i + 1)),
};

function timeframeKeySelector(option: TimeframeOptions) {
    return option.key;
}

function timeSpanKeySelector(option: TimespanOptions) {
    return option.key;
}

export interface TimespanInputValue {
    timeframe?: Timeframe;
    timespan?: number[];
}

interface Props {
    value?: TimespanInputValue;
    onChange: (value: TimespanInputValue) => void;
}

function TimespanInput(props: Props) {
    const {
        value,
        onChange,
    } = props;

    const strings = useTranslation(i18n);

    const timespanOptions = useMemo(() => {
        if (isNotDefined(value?.timeframe)) {
            return undefined;
        }
        return timespanOptionsMap[value?.timeframe];
    }, [value?.timeframe]);

    const handleTimeframeChange = (newTimeframe: Timeframe | undefined) => {
        onChange({
            ...value,
            timeframe: newTimeframe ?? 'months',
        });
    };

    const handleTimespanChange = (newTimespan: number[] | undefined) => {
        onChange({
            ...value,
            timespan: newTimespan,
        });
    };

    return (
        <>
            <SelectInput
                name="timeframe"
                label={strings.timeframeLabel}
                value={value?.timeframe}
                onChange={handleTimeframeChange}
                options={timeframeOptions}
                keySelector={timeframeKeySelector}
                labelSelector={stringValueSelector}
            />
            <Checklist
                name="timespan"
                label={strings.timespanLabel}
                value={value?.timespan}
                options={timespanOptions}
                keySelector={timeSpanKeySelector}
                labelSelector={stringValueSelector}
                onChange={handleTimespanChange}
            />
        </>
    );
}

export default TimespanInput;
