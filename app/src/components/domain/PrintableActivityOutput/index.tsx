import {
    useCallback,
    useMemo,
} from 'react';
import {
    compareNumber,
    isDefined,
    isNotDefined,
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

type OperationActivity = components['schemas']['OperationActivity'];

type ExtendedOperationActivity = Omit<OperationActivity, 'time_value'> & {
    time_value: number[] | string[];
};
type HoursTimeFrameKey = components['schemas']['EapHoursTimeframeValueEnumKey'];
type DaysTimeFrameKey = components['schemas']['EapDaysTimeframeValueEnumKey'];
type YearsTimeFrameKey = components['schemas']['EapYearsTimeframeValueEnumKey'];
type MonthsTimeFrameKey = components['schemas']['EapMonthsTimeframeValueEnumKey'];

function getFormattedActivityTimeline(activity: ExtendedOperationActivity | undefined) {
    if (isNotDefined(activity)) {
        return undefined;
    }

    const {
        time_value,
        timeframe_display,
    } = activity;

    const timeValueDisplay = time_value.join(',');

    return (
        `${timeValueDisplay} ${timeframe_display}`
    );
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
}

function PrintableActivityOutput(props: Props) {
    const {
        activity: currentActivity,
        prevActivity: previousActivity,
        withDiff,
        index,
    } = props;

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

    const timeValue = useCallback((timeArray: number[], timeframeKey: TimeFrameEnumKey) => {
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

    return (
        <PrintableDataDisplay
            label={(
                <PrintableLabel
                    value={getFormattedActivityLabel(activity, index)}
                    prevValue={getFormattedActivityLabel(prevActivity, index)}
                    withDiff={withDiff}
                />
            )}
            value={getFormattedActivityTimeline(activity)}
            prevValue={
                getFormattedActivityTimeline(prevActivity)
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
