import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import { monthKeyList } from '#utils/constants';

// NOTE: the backend stores this as a full date, we only expose month precision
const FULL_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const NUM_SELECTABLE_FUTURE_YEARS = 10;

export const DEFAULT_MONTH = '01';

interface Option {
    value: string;
    label: string;
}

export function getCurrentYear() {
    return new Date().getFullYear();
}

export function getYearMonthParts(value: string | undefined | null) {
    if (isNotDefined(value)) {
        return undefined;
    }

    const match = FULL_DATE_PATTERN.exec(value);
    const year = match?.[1];
    const month = match?.[2];

    if (isNotDefined(year) || isNotDefined(month)) {
        return undefined;
    }

    return { year, month };
}

export function getFullDateValue(year: string, month: string) {
    return `${year}-${month}-01`;
}

export function getMonthOptions(locale: string): Option[] {
    return monthKeyList.map((monthIndex) => {
        const date = new Date();
        // NOTE: set the day first so that setMonth cannot overflow into the next month
        date.setDate(1);
        date.setMonth(monthIndex);

        return {
            value: String(monthIndex + 1).padStart(2, '0'),
            label: date.toLocaleString(locale, { month: 'long' }),
        };
    });
}

export function getYearOptions(currentYear: number, selectedYear: string | undefined): Option[] {
    const years = Array.from(
        { length: NUM_SELECTABLE_FUTURE_YEARS + 1 },
        (_, index) => String(currentYear + index),
    );

    // NOTE: a saved record may hold a year outside the selectable window
    if (isDefined(selectedYear) && !years.includes(selectedYear)) {
        years.push(selectedYear);
        years.sort();
    }

    return years.map((year) => ({ value: year, label: year }));
}
