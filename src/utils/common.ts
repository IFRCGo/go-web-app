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
    sum,
} from '@togglecorp/fujs';

export const getHashFromBrowser = () => window.location.hash.substring(1);

export const setHashToBrowser = (hash: string | undefined) => {
    if (hash) {
        window.location.replace(`#${hash}`);
    } else {
        window.location.hash = '';
    }
};

export function sumSafe(list: (number | undefined | null)[] | undefined) {
    if (!list) {
        return undefined;
    }

    const safeList = list.filter(isDefined);
    return sum(safeList);
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

export function avg<L, V extends number>(list: L[], valueSelector: (item: L) => V) {
    if (!list || !Array.isArray(list)) {
        return undefined;
    }

    if (list.length === 0) {
        return 0;
    }

    const total = sum(list.map(valueSelector));

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
