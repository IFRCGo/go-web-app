import { sumSafe } from '@ifrc-go/ui/utils';
import {
    compareDate,
    isNotDefined,
    max,
} from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

type EventResponse = GoApiResponse<'/api/v2/event/'>;
type EventListItem = NonNullable<EventResponse['results']>[number];

export function getNumAffected(event: EventListItem) {
    const latestFieldReport = max(
        event.field_reports,
        (fieldReport) => new Date(fieldReport.updated_at).getTime(),
    );

    return sumSafe([
        event.num_affected,
        latestFieldReport?.num_affected,
    ]);
}

type EventItem = GoApiResponse<'/api/v2/event/{id}'>;
type FieldReport = EventItem['field_reports'][number];
type Appeal = EventItem['appeals'][number];

export function getLatestAppeal(appeals: Appeal[] | undefined) {
    if (isNotDefined(appeals) || appeals.length === 0) {
        return undefined;
    }

    // FIXME(frozenhelium): verify if this is the desired outcome
    return appeals.toSorted(
        (a, b) => compareDate(a.start_date, b.start_date),
    )[0];
}

function getFieldReport(
    reports: FieldReport[] | undefined,
    compareFunction: (
        a?: string,
        b?: string,
        direction?: number
    ) => number,
    direction?: number,
): FieldReport | undefined {
    if (isNotDefined(reports) || reports.length === 0) {
        return undefined;
    }

    // FIXME: use max function
    return reports.reduce((
        selectedReport: FieldReport | undefined,
        currentReport: FieldReport | undefined,
    ) => {
        if (isNotDefined(selectedReport)
            || compareFunction(
                currentReport?.report_date ?? currentReport?.created_at,
                selectedReport.report_date ?? selectedReport.created_at,
                direction,
            ) > 0) {
            return currentReport;
        }
        return selectedReport;
    }, undefined);
}

export function getLatestFieldReport(
    reports: FieldReport[] | undefined,
): FieldReport | undefined {
    return getFieldReport(
        reports,
        compareDate,
        1,
    );
}

export function getFirstFieldReport(
    reports: FieldReport[] | undefined,
): FieldReport | undefined {
    return getFieldReport(
        reports,
        compareDate,
        -1,
    );
}
