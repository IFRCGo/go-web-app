import {
    compareNumber,
    isNotDefined,
} from '@togglecorp/fujs';

import type { GoApiResponse } from '#utils/restRequest';

type SearchResponse = GoApiResponse<'/api/v1/search/'>;

type SearchResponseKeys = keyof SearchResponse;
// eslint-disable-next-line import/prefer-default-export
export const defaultRanking: Record<SearchResponseKeys, number> = {
    regions: 1,
    countries: 2,
    district_province_response: 3,

    emergencies: 4,
    projects: 5,
    surge_alerts: 6,
    surge_deployments: 7,
    reports: 8,
    rapid_response_deployments: 9,
};

export function getSortedTopItemsInList<DATUM>(
    list: undefined,
    valueSelector: (item: DATUM) => number,
    numItems?: number | undefined,
    othersSelector?: (remainingList: DATUM[]) => DATUM,
): undefined
export function getSortedTopItemsInList<DATUM>(
    list: DATUM[],
    valueSelector: (item: DATUM) => number,
    numItems?: number | undefined,
    othersSelector?: (remainingList: DATUM[]) => DATUM,
): DATUM[]
export function getSortedTopItemsInList<DATUM>(
    list: DATUM[] | undefined,
    valueSelector: (item: DATUM) => number,
    numItems = 5,
    othersSelector: undefined | ((remainingList: DATUM[]) => DATUM) = undefined,
) {
    if (isNotDefined(list)) {
        return undefined;
    }

    const sortedList = [...list].sort(
        (a, b) => compareNumber(valueSelector(a), valueSelector(b)),
    );

    const topN = sortedList.slice(0, numItems);

    if (!othersSelector) {
        return topN;
    }

    const remaining = sortedList.slice(numItems, sortedList.length - 1);
    const otherItem = othersSelector(remaining);
    return [...topN, otherItem];
}

export function incrementDate(date: Date, days = 1) {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

export function incrementMonth(date: Date, months = 1) {
    const newDate = new Date(date);
    newDate.setDate(1);
    newDate.setMonth(date.getMonth() + months);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

export function getNumberOfDays(start: Date, end: Date) {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    let numDays = 0;
    for (let i = startDate; i < endDate; i = incrementDate(i)) {
        numDays += 1;
    }

    return numDays;
}

export function getNumberOfMonths(start: Date, end: Date) {
    const monthDiff = Math.abs(
        ((12 * end.getFullYear()) + end.getMonth())
        - ((12 * start.getFullYear()) + start.getMonth()),
    );
    return monthDiff;
}

export function downloadFile(
    blob: Blob,
    filename: string,
    fileExtension: string,
): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${fileExtension}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}
