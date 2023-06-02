import { memo } from 'react';
import {
    isDefined,
    isNotDefined,
    isFalsy,
    isFalsyString,
    caseInsensitiveSubmatch,
    compareStringSearch,
    addSeparator,
    listToMap,
} from '@togglecorp/fujs';

import { CommonStrings } from '#strings/common';

export const getHashFromBrowser = () => window.location.hash.substring(1);

export const setHashToBrowser = (hash: string | undefined) => {
    if (hash) {
        window.location.replace(`#${hash}`);
    } else {
        window.location.hash = '';
    }
};

export function sumSafe(list: (number | undefined | null)[]): number {
    if (!list || list.length === 0) {
        return 0;
    }

    const safeList = list.filter((num) => isDefined(num)) as number[];
    return safeList.reduce((acc, item) => (
        acc + (+item)
    ), 0);
}

export function sum<L, V extends string | number>(list: L[], valueSelector: (item: L) => V) {
    if (!list || !Array.isArray(list)) {
        return 0;
    }

    const values = list
        .map(valueSelector)
        .filter(isDefined);

    return values.reduce((acc, item) => (
        acc + (+item)
    ), 0);
}

export function max<L, V extends string | number>(list: L[], valueSelector: (item: L) => V) {
    if (!list || !Array.isArray(list)) {
        return undefined;
    }

    const values = list
        .map(valueSelector)
        .filter(isDefined);

    // FIXME: the zero value may be problematic when there are negative numbers
    return values.reduce((acc, item) => (
        Math.max(acc, +item)
    ), 0);
}

export function avg<L, V extends string | number>(list: L[], valueSelector: (item: L) => V) {
    if (!list || !Array.isArray(list)) {
        return undefined;
    }

    if (list.length === 0) {
        return 0;
    }

    const total = sum(list, valueSelector);

    if (!isDefined(total)) {
        return 0;
    }

    return total / list.length;
}

export function aggregateList<T, R>(
    item: T[],
    keySelector: (item: T) => string | number,
    aggregator: (val: R | undefined, value: T) => R,
): R[] {
    const mapping = item.reduce(
        (acc, value) => {
            const key = keySelector(value);
            return {
                ...acc,
                [key]: aggregator(acc[key], value),
            };
        },
        {} as { [key: string]: R },
    );
    return Object.values(mapping);
}

export function transformObjectItems<K extends string, T, R>(
    obj: Record<K, T>,
    itemSelector: (item: T) => R,
) {
    const keys = Object.keys(obj) as K[];

    return keys.reduce((acc, val) => ({
        ...acc,
        [val]: itemSelector(obj[val]),
    }), {} as Record<K, R>);
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

export function compareLabel<O extends { label: string }>(a: O, b: O) {
    return a.label.localeCompare(b.label);
}

export function isObject(foo: unknown): foo is object {
    return typeof foo === 'object' && foo !== null && !Array.isArray(foo);
}

export function ymdToDateString(year: number, month: number, day: number) {
    const ys = String(year).padStart(4, '0');
    const ms = String(month + 1).padStart(2, '0');
    const ds = String(day).padStart(2, '0');

    return `${ys}-${ms}-${ds}`;
}

export function dateToDateString(val: Date) {
    const yyyy = val.getFullYear();
    const mm = val.getMonth();
    const dd = val.getDate();

    return ymdToDateString(yyyy, mm, dd);
}

export const genericMemo: (<T>(c: T) => T) = memo;

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

export function getFullMonthNameList(strings: CommonStrings) {
    return [
        strings.monthNameJanuary,
        strings.monthNameFebruary,
        strings.monthNameMarch,
        strings.monthNameApril,
        strings.monthNameMay,
        strings.monthNameJune,
        strings.monthNameJuly,
        strings.monthNameAugust,
        strings.monthNameSeptember,
        strings.monthNameOctober,
        strings.monthNameNovember,
        strings.monthNameDecember,
    ] as const;
}

export function avgSafe(list: (number | undefined | null)[]) {
    const listSafe = (list ?? []).filter((i) => isDefined(i) && !Number.isNaN(i)) as number[];
    return avg(listSafe, (d) => d);
}

export function isValidNumber(value: unknown): value is number {
    if (isFalsy(value)) {
        return false;
    }

    if (Number.isNaN(+(value as number))) {
        return false;
    }

    if (value === null) {
        return false;
    }

    return true;
}

export function downloadFromUrl(url: string, downloadFileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFileName;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function isIfrcUser(user: {
    email: string;
    is_ifrc_admin: boolean;
} | undefined) {
    if (!user) {
        return false;
    }

    const {
        email,
        is_ifrc_admin, // eslint-disable-line camelcase
    } = user;

    if (is_ifrc_admin) { // eslint-disable-line camelcase
        return true;
    }

    if (!email) {
        return false;
    }

    const parts = email.split('@');
    if (parts.length < 2) {
        return false;
    }

    const lastPart = parts[parts.length - 1];
    if (!lastPart) {
        return false;
    }

    if (lastPart.toLowerCase() === 'ifrc.org') {
        return true;
    }

    return false;
}

export type SetValueArg<T> = T | ((value: T) => T);

const DBL_EPSILON = 2.2204460492503131e-16;
const DBL_MIN = 2.2250738585072013830902327173324040642192159804623318306e-308;
const DBL_MAX = 1.7976931348623157E+308;

export function getPrettyBreakpoints(
    // Lower limit
    l: number,

    // Upper limit
    u: number,

    // integer giving the desired number of intervals. Non-integer values are rounded down.
    n = 5,

    // nonnegative integer giving the minimal number of intervals.
    minN = Math.floor(n / 3),

    /*
     * positive number, a factor (smaller than one) by which a default scale
     * is shrunk in the case when range is very small
     */

    shrinkSml = 0.75,

    /*
     * [high.u.bias, u5.bias]
     * high.u.bias -> non-negative numeric, typically > 1 .
     * The interval unit is determined as {1,2,5,10} times b, a power of 10.
     * Larger high.u.bias values favor larger units.
     * u5.bias -> non-negative numeric multiplier favoring factor 5 over 2.
     * Default and ‘optimal’: u5.bias = .5 + 1.5*high.u.bias.
    */
    highUFact: [number, number] = [0.5, 0.5 + 1.5 * 1.5],

    /* integer code, one of {0,1,2}. If non-0, an epsilon correction is made at
     * the boundaries such that the result boundaries will be outside range;
     * in the small case, the correction is only done if eps.correct >= 2.
     */

    epsCorrection = 0,

    returnBounds = true,
) {
    let lo = l;
    let up = u;
    let ndiv = n;

    const roundingEps = 1e-10;
    const [h, h5] = highUFact;

    let cell: number;
    let unit: number;
    let U: number;
    let ns: number;
    let nu: number;
    let k: number;
    let iSmall: boolean;

    const dx = up - lo;

    if (dx === 0 && up === 0) {
        cell = 1;
        iSmall = true;
    } else {
        cell = Math.max(Math.abs(lo), Math.abs(up));
        U = 1 + ((h5 >= 1.5 * h + 0.5) ? 1 / (1 + h) : 1.5 / (1 + h5));
        U *= Math.max(1, ndiv) * DBL_EPSILON;
        iSmall = dx < cell * U * 3;
    }

    if (iSmall) {
        if (cell > 10) {
            cell = 9 + cell / 10;
        }
        cell *= shrinkSml;
        if (minN > 1) {
            cell /= minN;
        }
    } else {
        cell = dx;
        if (ndiv > 1) {
            cell /= ndiv;
        }
    }

    if (cell < 20 * DBL_MIN) {
        console.warn('very small range.. corrected'); // eslint-disable-line no-console
        cell = 20 * DBL_MIN;
    } else if (cell * 10 > DBL_MAX) {
        console.warn('very large range.. corrected'); // eslint-disable-line no-console
        cell = 0.1 * DBL_MAX;
    }

    /* base <= cell < 10*base */
    const base = 10.0 ** Math.floor(Math.log10(cell));

    unit = base;
    U = 2 * base;
    if (U - cell < h * (cell - unit)) {
        unit = U;
        U = 5 * base;
        if (U - cell < h5 * (cell - unit)) {
            unit = U;
            U = 10 * base;
            if (U - cell < h * (cell - unit)) {
                unit = U;
            }
        }
    }

    ns = Math.floor(lo / unit + roundingEps);
    nu = Math.ceil(up / unit - roundingEps);

    if (epsCorrection && (epsCorrection > 1 || !iSmall)) {
        if (lo !== 0.0) {
            lo *= (1 - DBL_EPSILON);
        } else {
            lo = -DBL_MIN;
        }
        if (up !== 0.0) {
            up *= (1 + DBL_EPSILON);
        } else {
            up = +DBL_MIN;
        }
    }

    while (ns * unit > lo + roundingEps * unit) {
        ns -= 1;
    }

    while (nu * unit < up - roundingEps * unit) {
        nu += 1;
    }

    k = Math.floor(0.5 + nu - ns);
    if (k < minN) {
        k = minN - k;
        if (ns >= 0.0) {
            nu += Math.floor(k / 2);
            ns -= Math.floor(k / 2) + (k % 2);
        } else {
            ns -= Math.floor(k / 2);
            nu += Math.floor(k / 2) + (k % 2);
        }
        ndiv = minN;
    } else {
        ndiv = k;
    }

    if (returnBounds) {
        if (ns * unit < lo) {
            lo = ns * unit;
        }
        if (nu * unit > up) {
            up = nu * unit;
        }
    } else {
        lo = ns;
        up = nu;
    }

    return {
        unit,
        lo,
        up,
        ndiv,
    };
}

export function formatBoolean(value: boolean | undefined | null) {
    if (value === true) {
        return 'Yes';
    }

    if (value === false) {
        return 'No';
    }

    return '-';
}

export function formatNumber(value: number | undefined | null, prefix?: string): string {
    const defaultValue = '-';

    if (isValidNumber(value)) {
        const formattedNumber = addSeparator(value) ?? defaultValue;

        if (prefix) {
            return `${prefix}${formattedNumber}`;
        }

        return formattedNumber;
    }

    return defaultValue;
}

export function round(value: number, decimals = 2) {
    return Math.round(value * 10 ** decimals) / 10 ** decimals;
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

    const aMap = listToMap(aList, (a) => a, () => true);
    return bList.every((b) => aMap[b]);
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

export function isValidCountry(country: {
    independent: boolean | null,
    is_deprecated: boolean | null,
}) {
    return country.independent !== false && !country.is_deprecated;
}

export function plural(
    singularString: string,
    pluralString: string,
    number: number,
) {
    return number === 1 ? singularString : pluralString;
}

export function getDuration(start: Date, end: Date) {
    // eslint-disable-next-line no-console
    console.info(start, end);
    return 'Not implemented';
}
