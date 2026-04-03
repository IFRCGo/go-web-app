import { isNotDefined } from '@togglecorp/fujs';

export function getFullDateFromYearMonth(val: string | undefined) {
    if (isNotDefined(val)) {
        return undefined;
    }
    return `${val}-01`;
}

export function getYearMonthFromFullDate(val: string | undefined) {
    if (isNotDefined(val)) {
        return undefined;
    }
    return val?.slice(0, 7);
}
