import {
    isDefined,
    isNotDefined,
    isFalsyString,
    caseInsensitiveSubmatch,
    compareStringSearch,
    sum,
    isTruthyString,
    Maybe,
    populateFormat,
    breakFormat,
} from '@togglecorp/fujs';
import { DEFAULT_DATE_FORMAT } from './constants';

export type UnsafeNumberList = Maybe<Maybe<number>[]>;

type DeepNonNullable<T> = T extends object ? (
    T extends (infer K)[] ? (
        DeepNonNullable<K>[]
    ) : (
        { [P in keyof T]-?: DeepNonNullable<T[P]> }
    )
) : T;

export type DeepReplace<T, A, B> = (
    DeepNonNullable<T> extends DeepNonNullable<A>
        ? B
        : (
            T extends (infer Z)[]
                ? DeepReplace<Z, A, B>[]
                : (
                    T extends object
                        ? { [K in keyof T]: DeepReplace<T[K], A, B> }
                        : T
                )
        )
)

function getNumberListSafe(list: UnsafeNumberList) {
    if (!list) {
        return undefined;
    }

    const safeList = list.filter(isDefined);

    if (safeList.length === 0) {
        return undefined;
    }

    return safeList;
}

export function sumSafe(list: UnsafeNumberList) {
    const safeList = getNumberListSafe(list);
    if (!safeList) {
        return undefined;
    }

    return sum(safeList);
}

export function maxSafe(list: UnsafeNumberList) {
    const safeList = getNumberListSafe(list);
    if (!safeList) {
        return undefined;
    }

    return Math.max(...safeList);
}

export function minSafe(list: UnsafeNumberList) {
    const safeList = getNumberListSafe(list);
    if (!safeList) {
        return undefined;
    }

    return Math.min(...safeList);
}

export function avgSafe(list: UnsafeNumberList) {
    const safeList = getNumberListSafe(list);
    if (!safeList) {
        return undefined;
    }

    const listSum = sum(safeList);
    return listSum / safeList.length;
}

export function isObject(foo: unknown): foo is object {
    return typeof foo === 'object' && foo !== null && !Array.isArray(foo);
}

export function rankedSearchOnList<T>(
    list: T[],
    searchString: string | undefined,
    labelSelector: (item: T) => string,
) {
    if (isFalsyString(searchString)) {
        return list;
    }

    return list
        .filter((option) => caseInsensitiveSubmatch(labelSelector(option), searchString))
        .sort((a, b) => compareStringSearch(
            labelSelector(a),
            labelSelector(b),
            searchString,
        ));
}

function suffix(num: number, suffixStr: string, skipZero: boolean) {
    if (num === 0) {
        return skipZero ? '' : '0';
    }

    const formatter = Intl.NumberFormat(navigator.language, { notation: 'compact' });
    return `${formatter.format(num)} ${suffixStr}${num !== 1 ? 's' : ''}`;
}

type DurationNumeric = 0 | 1 | 2 | 3 | 4 | 5;

const mappings: {
    [x in DurationNumeric]: {
        text: string;
        shortText: string;
        value: number;
    }
} = {
    0: {
        shortText: 'yr',
        text: 'year',
        value: 365 * 24 * 60 * 60,
    },
    1: {
        shortText: 'mo',
        text: 'month',
        value: 30 * 24 * 60 * 60,
    },
    2: {
        shortText: 'day',
        text: 'day',
        value: 24 * 60 * 60,
    },
    3: {
        shortText: 'hr',
        text: 'hour',
        value: 60 * 60,
    },
    4: {
        shortText: 'min',
        text: 'minute',
        value: 60,
    },
    5: {
        shortText: 'sec',
        text: 'second',
        value: 1,
    },
};

function formatTimeDurationForSecs(
    seconds: number,
    separator = ' ',
    shorten = false,
    stop = 2,

    currentState: DurationNumeric = 0,
    lastState: number | undefined = undefined,
): string {
    if (isDefined(lastState) && currentState >= lastState) {
        return '';
    }

    if (currentState === 5) {
        return suffix(seconds, shorten ? 'sec' : 'second', isDefined(lastState));
    }

    const nextState: DurationNumeric = (currentState + 1) as DurationNumeric;

    const map = mappings[currentState];
    const dur = Math.floor(seconds / map.value);
    if (dur >= 1) {
        return [
            suffix(dur, shorten ? map.shortText : map.text, isDefined(lastState)),
            formatTimeDurationForSecs(
                seconds % map.value,
                separator,
                shorten,
                stop,
                nextState,
                lastState ?? (currentState + stop) as DurationNumeric,
            ),
        ].filter(Boolean).join(' ');
    }

    return formatTimeDurationForSecs(
        seconds,
        separator,
        shorten,
        stop,
        nextState,
        lastState,
    );
}

export function getDuration(start: Date, end: Date) {
    const timeDiff = end.getTime() - start.getTime();

    const seconds = Math.round(timeDiff / 1000);
    return formatTimeDurationForSecs(seconds);
}

export function isWhitelistedEmail(
    email: string,
    whitelistedDomains: { domain_name: string; is_active?: boolean }[],
) {
    // FIXME: add tests
    // Looking for an EXACT match in the domain whitelist
    // (it finds even if UPPERCASE letters were used)
    const userMailDomain = email
        .toLowerCase()
        .substring(email.lastIndexOf('@') + 1);
    return whitelistedDomains
        .filter((item) => item.is_active)
        .map((item) => item.domain_name.toLowerCase())
        .includes(userMailDomain);
}

interface FormatNumberOptions {
    currency?: boolean;
    unit?: Intl.NumberFormatOptions['unit'];
    maximumFractionDigits?: Intl.NumberFormatOptions['maximumFractionDigits'];
    compact?: boolean;
    separatorHidden?: boolean,
}

export function formatNumber(
    value: number | null | undefined,
    options?: FormatNumberOptions,
) {
    if (isNotDefined(value)) {
        return undefined;
    }

    const formattingOptions: Intl.NumberFormatOptions = {};

    if (!options) {
        formattingOptions.maximumFractionDigits = Math.abs(value) >= 1000 ? 0 : 2;
        return new Intl.NumberFormat(navigator.language, formattingOptions).format(value);
    }

    const {
        currency,
        unit,
        maximumFractionDigits,
        compact,
        separatorHidden,
    } = options;

    if (isTruthyString(unit)) {
        formattingOptions.unit = unit;
        formattingOptions.unitDisplay = 'short';
    }
    if (currency) {
        formattingOptions.currencyDisplay = 'narrowSymbol';
        formattingOptions.style = 'currency';
    }
    if (compact) {
        formattingOptions.notation = 'compact';
        formattingOptions.compactDisplay = 'short';
    }

    formattingOptions.useGrouping = !separatorHidden;

    if (isDefined(maximumFractionDigits)) {
        formattingOptions.maximumFractionDigits = maximumFractionDigits;
    } else {
        formattingOptions.maximumFractionDigits = Math.abs(value) >= 1000 ? 0 : 2;
    }

    const newValue = new Intl.NumberFormat(navigator.language, formattingOptions)
        .format(value);

    return newValue;
}

export function formatDate(
    value: Date | string | number | null | undefined,
    format = DEFAULT_DATE_FORMAT,
) {
    if (isNotDefined(value)) {
        return undefined;
    }

    const date = new Date(value);

    // Check if valid date
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    const formattedValueList = populateFormat(breakFormat(format), date);
    const formattedDate = formattedValueList.find((d) => d.type === 'date');

    return formattedDate?.value;
}

export function splitList<X, Y>(
    list: (X | Y)[],
    splitPointSelector: (item: X | Y, i: number) => item is X,
): Y[][] {
    const breakpointIndices = list.map(
        (item, i) => (splitPointSelector(item, i) ? i : undefined),
    ).filter(isDefined);

    if (breakpointIndices.length === 0) {
        return [list as Y[]];
    }

    return [...breakpointIndices, list.length].map(
        (breakpointIndex, i) => {
            const prevIndex = i === 0
                ? 0
                : breakpointIndices[i - 1] + 1;

            if (prevIndex === breakpointIndex) {
                return undefined;
            }

            const newList = list.slice(prevIndex, breakpointIndex);
            return newList as Y[];
        },
    ).filter(isDefined);
}

export function getNumberOfDaysInMonth(year: number, month: number) {
    const dateWithLastDateOfPrevMonth = new Date(year, month + 1, 0);
    return dateWithLastDateOfPrevMonth.getDate();
}

export function injectClientId<V extends { id: number }>(obj: V): (V & { client_id: string }) {
    return {
        ...obj,
        client_id: String(obj.id),
    };
}

export function getMonthList() {
    const monthKeyList = Array.from(Array(12).keys());
    return monthKeyList.map(
        (monthKey) => {
            const date = new Date();
            date.setDate(1);
            date.setMonth(monthKey);

            return {
                key: monthKey,
                label: date.toLocaleString(
                    navigator.language,
                    { month: 'long' },
                ),
            };
        },
    );
}
