import { Children, Fragment, createElement } from 'react';
import {
    isDefined,
    isNotDefined,
    isFalsyString,
    caseInsensitiveSubmatch,
    compareStringSearch,
    listToMap,
    sum,
    isTruthyString,
} from '@togglecorp/fujs';

import { components } from '#generated/types';

type UnsafeNumberList = (number | undefined | null)[] | null | undefined;

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
    if (!safeList || safeList.length === 0) {
        return undefined;
    }

    return sum(safeList);
}

export function maxSafe(list: UnsafeNumberList) {
    const safeList = getNumberListSafe(list);
    if (!safeList || safeList.length === 0) {
        return undefined;
    }

    return Math.max(...safeList);
}

export function minSafe(list: UnsafeNumberList) {
    const safeList = getNumberListSafe(list);
    if (!safeList || safeList.length === 0) {
        return undefined;
    }

    return Math.min(...safeList);
}

export function avgSafe(list: UnsafeNumberList) {
    const safeList = getNumberListSafe(list);
    if (!safeList || safeList.length === 0) {
        return undefined;
    }

    const listSum = sum(safeList);
    return listSum / safeList.length;
}

export function compareLabel<O extends { label: string }>(a: O, b: O) {
    return a.label.localeCompare(b.label);
}

export function isObject(foo: unknown): foo is object {
    return typeof foo === 'object' && foo !== null && !Array.isArray(foo);
}

// FIXME: use encode date
export function ymdToDateString(year: number, month: number, day: number) {
    const ys = String(year).padStart(4, '0');
    const ms = String(month + 1).padStart(2, '0');
    const ds = String(day).padStart(2, '0');

    return `${ys}-${ms}-${ds}`;
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

export function getSearchValue(key: string, url = window.location): string | undefined {
    const { search } = url;

    if (isNotDefined(search)) {
        return undefined;
    }

    if (search === '') {
        return undefined;
    }

    const searchElements = search.substring(1, search.length).split('&');
    const searchElementMap = listToMap(
        searchElements,
        (e) => e.split('=')[0],
        (e) => window.decodeURI(e.split('=')[1]),
    );

    return searchElementMap[key];
}

export function reTab(str: string | undefined | null) {
    if (isNotDefined(str)) {
        return str;
    }

    // Replace tab characters with 2 spaces
    const reTabbed = str.replaceAll('\t', '  ');

    // Remove all \r characters
    return reTabbed.replaceAll('\r', '');
}

type PartialCountry = components['schemas']['Country'];
type DefinedCountry = Omit<PartialCountry, 'iso' | 'name'> & {
    iso: string;
    name: string;
}
export function isValidCountry(country: PartialCountry): country is DefinedCountry {
    return isTruthyString(country.name)
        && isTruthyString(country.iso)
        && country.independent !== false
        && !country.is_deprecated;
}

type CountryWithDefinedNS = Omit<PartialCountry, 'iso' | 'name'> & {
    iso: string;
    name: string;
    society_name: string;
}
export function isValidNationalSociety(country: PartialCountry): country is CountryWithDefinedNS {
    return isValidCountry(country) && isTruthyString(country.name);
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

export function formatTimeDurationForSecs(
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

    if (!options) {
        return new Intl.NumberFormat(navigator.language).format(value);
    }

    const {
        currency,
        unit,
        maximumFractionDigits,
        compact,
        separatorHidden,
    } = options;

    const formattingOptions: Intl.NumberFormatOptions = {};

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

    return createElement(
        Fragment,
        {},
        ...joinedList,
    );
}
