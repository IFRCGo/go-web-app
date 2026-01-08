import {
    compareNumber,
    isNotDefined,
} from '@togglecorp/fujs';

import PrintableDataDisplay from '#components/printable/PrintableDataDisplay';
import PrintableLabel from '#components/printable/PrintableLabel';
import { type components } from '#generated/types';

type OperationActivity = components['schemas']['OperationActivity'];

function getFormattedActivityTimeline(activity: OperationActivity | undefined) {
    if (isNotDefined(activity)) {
        return undefined;
    }

    const {
        time_value,
        timeframe_display,
    } = activity;

    const timeValueDisplay = time_value.toSorted(
        (a, b) => compareNumber(a, b, -1),
    );

    return (
        `${timeValueDisplay} ${timeframe_display}`
    );
}

function getFormattedActivityLabel(activity: OperationActivity | undefined, index: number) {
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
        activity,
        prevActivity,
        withDiff,
        index,
    } = props;

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
