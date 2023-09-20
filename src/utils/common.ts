import { Children, Fragment, createElement } from 'react';
import {
    isDefined,
    listToMap,
    isNotDefined,
    isFalsyString,
    caseInsensitiveSubmatch,
    compareStringSearch,
    sum,
    isTruthyString,
    Maybe,
    populateFormat,
    breakFormat,
    randomString,
} from '@togglecorp/fujs';
import { type Language } from '#contexts/language';

import { DEFAULT_DATE_FORMAT } from './constants';

export type UnsafeNumberList = Maybe<Maybe<number>[]>;

type DeepNonNullable<T> = T extends object ? (
    T extends (infer K)[] ? (
        DeepNonNullable<K>[]
    ) : (
        { [P in keyof T]-?: DeepNonNullable<T[P]> }
    )
) : NonNullable<T>;

// FIXME: we might not need this type utility
type SanitizeKeys<T> = T extends string ? T : never;
type CheckPattern<KEY, KEYS extends string | number | symbol, PATTERN extends string> = KEY extends `${SanitizeKeys<KEYS>}${PATTERN}` ? never : KEY;
export type DeepRemoveKeyPattern<T, PATTERN extends string> = T extends object ? (
    T extends (infer K)[] ? (
        DeepRemoveKeyPattern<K, PATTERN>[]
    ) : (
        { [P in CheckPattern<keyof T, keyof T, PATTERN>]: DeepRemoveKeyPattern<T[P], PATTERN> }
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

type NotNevaKeys<T> = {
    [key in keyof T]-?: NonNullable<T[key]> extends never ? never : key
}[keyof T]

export type DeepNevaRemove<T> = T extends (infer Z)[]
    ? DeepNevaRemove<Z>[]
    : T extends object
        ? { [K in NotNevaKeys<T>]: DeepNevaRemove<T[K]> }
        : T;

export function roundSafe(value: number | undefined | null): number | undefined
export function roundSafe(value: number): number
export function roundSafe(value: number | undefined | null): number | undefined {
    if (isNotDefined(value)) {
        return undefined;
    }

    return Math.round(value);
}

export function getPercentage(value: number, total: number) {
    if (isNotDefined(value) || isNotDefined(total) || total === 0) {
        return 0;
    }

    return (value * 100) / total;
}

function getNumberListSafe(list: UnsafeNumberList) {
    if (isNotDefined(list)) {
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
    if (isNotDefined(safeList)) {
        return undefined;
    }

    return sum(safeList);
}

export function maxSafe(list: UnsafeNumberList) {
    const safeList = getNumberListSafe(list);
    if (isNotDefined(safeList)) {
        return undefined;
    }

    return Math.max(...safeList);
}

export function minSafe(list: UnsafeNumberList) {
    const safeList = getNumberListSafe(list);
    if (isNotDefined(safeList)) {
        return undefined;
    }

    return Math.min(...safeList);
}

export function avgSafe(list: UnsafeNumberList) {
    const safeList = getNumberListSafe(list);
    if (isNotDefined(safeList)) {
        return undefined;
    }

    const listSum = sum(safeList);
    return listSum / safeList.length;
}

export function getDuplicates<T, K extends string | number>(
    list: T[],
    keySelector: (item: T) => K,
    filter: (count: number) => boolean = (count) => count > 1,
) {
    const counts = listToMap<T, number, K>(
        list,
        keySelector,
        (_, key, __, acc) => {
            const value: number | undefined = acc[key];
            return isDefined(value) ? value + 1 : 1;
        },
    );
    return Object.keys(counts).filter((key) => filter(counts[key as K]));
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

// FIXME: add tests
export function isWhitelistedEmail(
    email: string,
    whitelistedDomains: { domain_name: string; is_active?: boolean }[],
) {
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
    language?: string,
}

export function formatNumber(
    value: null | undefined,
    options?: FormatNumberOptions,
): undefined
export function formatNumber(
    value: number | null | undefined,
    options?: FormatNumberOptions,
): undefined
export function formatNumber(
    value: number,
    options?: FormatNumberOptions,
): string
export function formatNumber(
    value: number | null | undefined,
    options?: FormatNumberOptions,
) {
    if (isNotDefined(value)) {
        return undefined;
    }

    const formattingOptions: Intl.NumberFormatOptions = {};

    if (isNotDefined(options)) {
        formattingOptions.maximumFractionDigits = Math.abs(value) >= 1000 ? 0 : 2;
        return new Intl.NumberFormat(undefined, formattingOptions).format(value);
    }

    const {
        currency,
        unit,
        maximumFractionDigits,
        compact,
        separatorHidden,
        language,
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

    const newValue = new Intl.NumberFormat(language, formattingOptions)
        .format(value);

    return newValue;
}

export function formatDate(
    value: string | Date | number,
    format: string,
): string;
export function formatDate(
    value: null | undefined,
    format: string,
): undefined;
export function formatDate(
    value: string | Date | number | null | undefined,
    format: string,
): string | undefined;
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

export function injectClientId<V extends {
    id?: number,
    client_id?: string | null,
}>(obj: V): (Omit<V, 'client_id'> & {
    client_id: string,
}) {
    return {
        ...obj,
        client_id: obj.client_id
            ?? (isDefined(obj.id) ? String(obj.id) : undefined)
            ?? randomString(),
    };
}

export function getCurrentMonthYear() {
    const now = new Date();
    return formatDate(now, 'MM/yyyy');
}

export function getMonthList() {
    const monthKeyList = Array.from(Array(12).keys());
    return monthKeyList.map(
        (monthKey) => {
            const date = new Date();
            date.setMonth(monthKey);
            date.setDate(1);
            date.setHours(0, 0, 0, 0);

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

export function denormalizeList<ListItem, SecondaryListItem, ReturnType>(
    list: ListItem[],
    secondaryListSelector: (li: ListItem) => SecondaryListItem[],
    transformFn: (li: ListItem, sli: SecondaryListItem) => ReturnType,
): ReturnType[] {
    const newList = list.map((li) => {
        const sl = secondaryListSelector(li);

        return sl.map((sli) => transformFn(li, sli));
    }).flat();

    return newList;
}

export function hasSomeDefinedValue(item: unknown) {
    if (isNotDefined(item)) {
        return false;
    }

    if (typeof item === 'boolean') {
        return true;
    }

    if (typeof item === 'number') {
        return !Number.isNaN(item);
    }

    if (typeof item === 'string') {
        return isTruthyString(item.trim());
    }

    if (Array.isArray(item)) {
        if (item.length === 0) {
            return false;
        }

        return item.some(hasSomeDefinedValue);
    }

    if (typeof item === 'object') {
        if (!item) {
            return false;
        }

        return Object.values(item).some(hasSomeDefinedValue);
    }

    return false;
}

export function joinList(list: React.ReactNode[], separator: React.ReactNode) {
    const joinedList = Children.toArray(list).reduce<React.ReactNode[]>(
        (acc, child, index, children) => {
            if (isNotDefined(child)) {
                return acc;
            }

            acc.push(child);

            if (index < (children.length - 1)) {
                acc.push(separator);
            }

            return acc;
        },
        [],
    );

    // FIXME: Add note on how does this work?
    return createElement(
        Fragment,
        {},
        ...joinedList,
    );
}

export function isSimilarArray<T extends string | number>(
    aList: T[] | undefined,
    bList: T[] | undefined,
) {
    if (!aList && !bList) {
        return true;
    }

    if (!aList || !bList) {
        return false;
    }

    if (aList.length !== bList.length) {
        return false;
    }

    if (aList.length === 0 && bList.length === 0) {
        return true;
    }

    const aMap = listToMap(
        aList,
        (a) => a,
        () => true,
    );
    return bList.every((b) => aMap[b]);
}

// NOTE: these doesn't need to be translated
export const languageNameMapEn: Record<Language, string> = {
    en: 'English',
    fr: 'French',
    es: 'Spanish',
    ar: 'Arabic',
};
