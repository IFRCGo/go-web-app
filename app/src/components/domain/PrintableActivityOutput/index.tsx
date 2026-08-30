import {
    useCallback,
    useMemo,
} from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    compareNumber,
    isDefined,
    isFalsyString,
    isNotDefined,
    isTruthyString,
    listToMap,
} from '@togglecorp/fujs';

import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import PrintableLabel from '#components/printable/PrintableLabel';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    TIMEFRAME_DAYS,
    TIMEFRAME_HOURS,
    TIMEFRAME_MONTHS,
    TIMEFRAME_YEAR,
    type TimeFrameEnumKey,
} from '#utils/constants';

import i18n from './i18n.json';

type OperationActivity = components['schemas']['OperationActivity']
    | components['schemas']['PrepositioningOperationActivity']
    | components['schemas']['EarlyActionOperationActivity'];

type ExtendedOperationActivity = Omit<OperationActivity, 'time_value'> & {
    time_value: number[] | string[];
};
type HoursTimeFrameKey = components['schemas']['EapHoursTimeframeValueEnumKey'];
type DaysTimeFrameKey = components['schemas']['EapDaysTimeframeValueEnumKey'];
type YearsTimeFrameKey = components['schemas']['EapYearsTimeframeValueEnumKey'];
type MonthsTimeFrameKey = components['schemas']['EapMonthsTimeframeValueEnumKey'];

interface TimelineOptions {
    withActivation?: boolean;
    withoutTimeframe?: boolean;
    activationOneLabel: string;
    activationTwoLabel: string;
}

function getFormattedActivityTimeline(
    activity: ExtendedOperationActivity | undefined,
    options: TimelineOptions,
) {
    if (isNotDefined(activity)) {
        return undefined;
    }

    const {
        time_value,
        timeframe_display,
        activation_one,
        activation_two,
    } = activity;

    const {
        withActivation,
        withoutTimeframe,
        activationOneLabel,
        activationTwoLabel,
    } = options;

    const timeframeDisplay = withoutTimeframe || time_value.length === 0
        ? undefined
        : [time_value.join(','), timeframe_display].filter(isTruthyString).join(' ');

    const activationDisplay = withActivation
        ? [
            activation_one ? activationOneLabel : undefined,
            activation_two ? activationTwoLabel : undefined,
        ].filter(isDefined).join(', ')
        : undefined;

    if (isFalsyString(activationDisplay)) {
        return timeframeDisplay;
    }

    if (isFalsyString(timeframeDisplay)) {
        return activationDisplay;
    }

    return `${timeframeDisplay} (${activationDisplay})`;
}

function getFormattedActivityLabel(activity: ExtendedOperationActivity | undefined, index: number) {
    if (isNotDefined(activity)) {
        return undefined;
    }

    return `${index + 1}. ${activity.activity}`;
}

interface Props {
    activity: OperationActivity;
    prevActivity: OperationActivity | undefined;
    withDiff: boolean;
    index: number;
    withActivation?: boolean;
    withoutTimeframe?: boolean;
}

function PrintableActivityOutput(props: Props) {
    const {
        activity: currentActivity,
        prevActivity: previousActivity,
        withDiff,
        index,
        withActivation,
        withoutTimeframe,
    } = props;

    const strings = useTranslation(i18n);

    const {
        eap_years_timeframe_value,
        eap_months_timeframe_value,
        eap_days_timeframe_value,
        eap_hours_timeframe_value,
    } = useGlobalEnums();

    const hoursTimeframeMap = useMemo(() => (
        listToMap(
            eap_hours_timeframe_value,
            ({ key }) => key,
            ({ value: label }) => label,
        )
    ), [eap_hours_timeframe_value]);

    const daysTimeframeMap = useMemo(() => (
        listToMap(
            eap_days_timeframe_value,
            ({ key }) => key,
            ({ value: label }) => label,
        )
    ), [eap_days_timeframe_value]);

    const monthsTimeframeMap = useMemo(() => (
        listToMap(
            eap_months_timeframe_value,
            ({ key }) => key,
            ({ value: label }) => label,
        )
    ), [eap_months_timeframe_value]);

    const yearsTimeframeMap = useMemo(() => (
        listToMap(
            eap_years_timeframe_value,
            ({ key }) => key,
            ({ value: label }) => label,
        )
    ), [eap_years_timeframe_value]);

    const timeValue = useCallback((
        timeArray: number[] | undefined | null,
        timeframeKey: TimeFrameEnumKey | undefined | null,
    ) => {
        if (isNotDefined(timeArray)) {
            return [];
        }

        const sortedTimeValue = timeArray.toSorted(compareNumber);

        if (timeframeKey === TIMEFRAME_HOURS && isDefined(hoursTimeframeMap)) {
            return sortedTimeValue.map(
                (hour) => hoursTimeframeMap?.[hour as HoursTimeFrameKey],
            ).filter(isDefined);
        }
        if (timeframeKey === TIMEFRAME_DAYS && isDefined(daysTimeframeMap)) {
            return sortedTimeValue.map(
                (day) => daysTimeframeMap?.[day as DaysTimeFrameKey],
            ).filter(isDefined);
        }

        if (timeframeKey === TIMEFRAME_MONTHS && isDefined(monthsTimeframeMap)) {
            return sortedTimeValue.map(
                (month) => monthsTimeframeMap?.[month as MonthsTimeFrameKey],
            ).filter(isDefined);
        }

        if (timeframeKey === TIMEFRAME_YEAR && isDefined(yearsTimeframeMap)) {
            return sortedTimeValue.map(
                (year) => yearsTimeframeMap?.[year as YearsTimeFrameKey],
            ).filter(isDefined);
        }

        return sortedTimeValue;
    }, [
        hoursTimeframeMap,
        daysTimeframeMap,
        monthsTimeframeMap,
        yearsTimeframeMap,
    ]);

    const activity = {
        ...currentActivity,
        time_value: timeValue(currentActivity.time_value, currentActivity.timeframe),
    };

    const prevActivity = isDefined(previousActivity) ? {
        ...previousActivity,
        time_value: timeValue(previousActivity?.time_value, previousActivity?.timeframe),
    } : previousActivity;

    const timelineOptions = {
        withActivation,
        withoutTimeframe,
        activationOneLabel: strings.activationOneLabel,
        activationTwoLabel: strings.activationTwoLabel,
    };

    return (
        <PrintableDataDisplay
            label={(
                <PrintableLabel
                    value={getFormattedActivityLabel(activity, index)}
                    prevValue={getFormattedActivityLabel(prevActivity, index)}
                    withDiff={withDiff}
                />
            )}
            value={getFormattedActivityTimeline(activity, timelineOptions)}
            prevValue={
                getFormattedActivityTimeline(prevActivity, timelineOptions)
            }
            valueType="text"
            variant="contents"
            withBackground
            withPadding
            withoutLabelColon
            withDiff={withDiff}
        />
    );
}

export default PrintableActivityOutput;
