import {
    maxSafe,
    minSafe,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { type GoApiResponse } from '#utils/restRequest';

type GetRapidResponseByEvent = GoApiResponse<'/api/v2/personnel_by_event/'>;
type GetERUByEvent = GoApiResponse<'/api/v2/deployed_eru_by_event/'>;
type RapidResponseByEventItem = NonNullable<GetRapidResponseByEvent['results']>[number];
type EruByEventItem= NonNullable<GetERUByEvent['results']>[number];

interface DateRangeItem {
    start_date: string | null | undefined,
    end_date: string | null | undefined,
}

function extractDates(
    items: DateRangeItem[],
    accessor: (data: DateRangeItem) => string | number | null | undefined,
) {
    return (
        items.flatMap((item) => accessor(item))
            .filter(isDefined).map((date) => new Date(date).getTime())
    );
}

export function getRapidResponseEventDates(data: RapidResponseByEventItem[] | undefined) {
    if (isNotDefined(data) || data.length < 1) {
        return undefined;
    }
    const appealStartDateList = extractDates(
        data.flatMap((event) => event.appeals),
        (appeal) => appeal.start_date,
    );
    const appealEndDateList = extractDates(
        data.flatMap((event) => event.appeals),
        (appeal) => appeal.end_date,
    );

    const personnelStarDateList = extractDates(
        data.flatMap((event) => (
            event.deployments.flatMap((deployment) => deployment.personnel)
        )),
        (personnel) => personnel.start_date,
    );

    const personnelEndDateList = extractDates(
        data.flatMap((event) => (
            event.deployments.flatMap((deployment) => deployment.personnel)
        )),
        (personnel) => personnel.end_date,
    );

    const appealStartDate = minSafe(appealStartDateList);
    const appealEndDate = maxSafe(appealEndDateList);
    const personnelStartDate = minSafe(personnelStarDateList);
    const personnelEndDate = maxSafe(personnelEndDateList);
    const timelineStartDate = minSafe([...appealStartDateList, ...personnelStarDateList]);
    const timelineEndDate = maxSafe([...appealEndDateList, ...personnelEndDateList]);

    return {
        appealStartDate: isDefined(appealStartDate) ? new Date(appealStartDate) : undefined,
        appealEndDate: isDefined(appealEndDate) ? new Date(appealEndDate) : undefined,
        personnelStartDate: isDefined(personnelStartDate)
            ? new Date(personnelStartDate) : undefined,
        personnelEndDate: isDefined(personnelEndDate) ? new Date(personnelEndDate) : undefined,
        timelineStartDate: isDefined(timelineStartDate) ? new Date(timelineStartDate) : undefined,
        timelineEndDate: isDefined(timelineEndDate) ? new Date(timelineEndDate) : undefined,
    };
}

export function getEruEventDates(data: EruByEventItem[] | undefined) {
    if (isNotDefined(data) || data.length < 1) {
        return undefined;
    }
    const appealStartDateList = extractDates(
        data.flatMap((event) => event.appeals),
        (event) => event.start_date,
    );
    const appealEndDateList = extractDates(
        data.flatMap((event) => event.appeals),
        (appeal) => appeal.end_date,
    );

    const eruStarDateList = extractDates(
        data.flatMap((event) => (
            event.active_erus
        )),
        (eru) => eru.start_date,
    );
    const eruEndDateList = extractDates(
        data.flatMap((event) => (
            event.active_erus
        )),
        (eru) => eru.end_date,
    );

    const appealStartDate = minSafe(appealStartDateList);
    const appealEndDate = maxSafe(appealEndDateList);
    const eruStartDate = minSafe(eruStarDateList);
    const eruEndDate = maxSafe(eruEndDateList);
    const timelineStartDate = minSafe([...appealStartDateList, ...eruStarDateList]);
    const timelineEndDate = maxSafe([...appealEndDateList, ...eruEndDateList]);

    return {
        appealStartDate: isDefined(appealStartDate) ? new Date(appealStartDate) : undefined,
        appealEndDate: isDefined(appealEndDate) ? new Date(appealEndDate) : undefined,
        eruStartDate: isDefined(eruStartDate)
            ? new Date(eruStartDate) : undefined,
        eruEndDate: isDefined(eruEndDate) ? new Date(eruEndDate) : undefined,
        timelineStartDate: isDefined(timelineStartDate) ? new Date(timelineStartDate) : undefined,
        timelineEndDate: isDefined(timelineEndDate) ? new Date(timelineEndDate) : undefined,
    };
}
