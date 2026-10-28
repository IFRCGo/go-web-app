import {
    type SetStateAction,
    useCallback,
    useMemo,
    useReducer,
    useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { hasSomeDefinedValue } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
} from '@togglecorp/fujs';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import useDebouncedValue from '#hooks/useDebouncedValue';
import { type UrlParam } from '#utils/urlParam';

type SortDirection = 'asc' | 'dsc';
interface SortParameter {
    name: string;
    direction: SortDirection;
}
function getOrdering(sorting: SortParameter | undefined) {
    if (isNotDefined(sorting)) {
        return undefined;
    }
    if (sorting.direction === 'asc') {
        return sorting.name;
    }
    return `-${sorting.name}`;
}

// NOTE: a field kept in the URL must be optional, a link without the param leaves it undefined
export type UrlParams<FILTER> = {
    [KEY in keyof FILTER]?: undefined extends FILTER[KEY]
        ? UrlParam<NonNullable<FILTER[KEY]>>
        : never;
};

type UrlParamEntry = [field: string, param: UrlParam<unknown>];

function getUrlParamEntries<FILTER>(urlParams: UrlParams<FILTER> | undefined) {
    return (Object.entries(urlParams ?? {}) as [string, UrlParam<unknown> | undefined][])
        .filter((entry): entry is UrlParamEntry => isDefined(entry[1]));
}

// NOTE: only the params the list declares, as a string that can be compared by value
function getUrlKey(searchParams: URLSearchParams, urlParamEntries: UrlParamEntry[]) {
    const ownParams = new URLSearchParams();
    urlParamEntries.forEach(([, param]) => {
        const value = searchParams.get(param.key);
        if (isDefined(value)) {
            ownParams.set(param.key, value);
        }
    });
    return ownParams.toString();
}

function parseUrlKey<FILTER>(urlKey: string, urlParamEntries: UrlParamEntry[]) {
    const ownParams = new URLSearchParams(urlKey);
    return Object.fromEntries(urlParamEntries.map(([field, param]) => {
        const value = ownParams.get(param.key);
        return [field, isDefined(value) ? param.parse(value) : undefined];
    })) as Partial<FILTER>;
}

function omitUrlFields<FILTER extends object>(
    filter: FILTER,
    urlParamEntries: UrlParamEntry[],
) {
    const urlFields = new Set(urlParamEntries.map(([field]) => field));
    return Object.fromEntries(
        Object.entries(filter).filter(([field]) => !urlFields.has(field)),
    ) as FILTER;
}

interface ResetFilterAction {
    type: 'reset-filter';
}

interface SetFilterAction<FILTER extends object> {
    type: 'set-filter';
    value: SetStateAction<FILTER>;
}

interface SetPageAction {
    type: 'set-page';
    value: number;
    urlKey: string;
}

interface SetOrderingAction {
    type: 'set-ordering'
    value: SetStateAction<SortParameter | undefined>;
}

type FilterActions<FILTER extends object> = (
    ResetFilterAction
    | SetFilterAction<FILTER>
    | SetPageAction
    | SetOrderingAction
);

interface FilterState<FILTER> {
    // NOTE: fields kept in the URL are read from the URL, never from here
    filter: FILTER,
    ordering: SortParameter | undefined,
    page: number,
    pageUrlKey: string,
}

// NOTE: a page belongs to the URL filters it was picked under; any other URL means page 1
function getPage(state: FilterState<unknown>, urlKey: string) {
    return state.pageUrlKey === urlKey ? state.page : 1;
}

const defaultOrdering: SortParameter = {
    name: 'id',
    direction: 'dsc',
};

function useFilterState<FILTER extends object>(options: {
    filter: FILTER,
    // NOTE: the filter the list starts from (e.g. from router state); resetFilter still
    // returns to `filter`
    initialFilter?: FILTER,
    // NOTE: declare it outside the component, or `filter` changes on every render
    urlParams?: UrlParams<FILTER>,
    ordering?: SortParameter | undefined,
    page?: number,
    pageSize?: number,
    debounceTime?: number,
}) {
    const {
        filter,
        initialFilter,
        urlParams,
        ordering = defaultOrdering,
        page = 1,
        pageSize = 10,
        debounceTime = 200,
    } = options;

    const [searchParams, setSearchParams] = useSearchParams();
    const urlParamEntries = useMemo(() => getUrlParamEntries(urlParams), [urlParams]);
    const hasUrlParams = urlParamEntries.length > 0;
    const urlKey = getUrlKey(searchParams, urlParamEntries);
    const urlFilter = useMemo(
        () => parseUrlKey<FILTER>(urlKey, urlParamEntries),
        [urlKey, urlParamEntries],
    );

    const [state, dispatch] = useReducer<FilterState<FILTER>, [action: FilterActions<FILTER>]>(
        (prevState, action) => {
            if (action.type === 'reset-filter') {
                return {
                    ...prevState,
                    filter,
                    ordering,
                    page,
                };
            }
            if (action.type === 'set-filter') {
                return {
                    ...prevState,
                    filter: typeof action.value === 'function'
                        ? action.value(prevState.filter)
                        : action.value,
                    page: 1,
                };
            }
            if (action.type === 'set-page') {
                return {
                    ...prevState,
                    page: action.value,
                    pageUrlKey: action.urlKey,
                };
            }
            if (action.type === 'set-ordering') {
                return {
                    ...prevState,
                    ordering: typeof action.value === 'function'
                        ? action.value(prevState.ordering)
                        : action.value,
                    page: 1,
                };
            }
            return prevState;
        },
        {
            filter: initialFilter ?? filter,
            ordering,
            page,
            pageUrlKey: urlKey,
        },
    );

    const rawFilter = useMemo(
        () => (hasUrlParams ? { ...state.filter, ...urlFilter } : state.filter),
        [hasUrlParams, state.filter, urlFilter],
    );

    const lastUrlWriteRef = useRef<{
        from: URLSearchParams,
        to: URLSearchParams,
    }>(undefined);

    const writeOwnUrl = useCallback(
        (getNewUrlFilter: (prevUrlFilter: Partial<FILTER>) => Partial<FILTER>) => {
            // NOTE: handlers see the URL of their render, so chain writes made in one handler
            const lastUrlWrite = lastUrlWriteRef.current;
            const prevSearchParams = lastUrlWrite?.from === searchParams
                ? lastUrlWrite.to
                : searchParams;
            const newUrlFilter = getNewUrlFilter(parseUrlKey<FILTER>(
                getUrlKey(prevSearchParams, urlParamEntries),
                urlParamEntries,
            ));

            const newSearchParams = new URLSearchParams(prevSearchParams);
            urlParamEntries.forEach(([field, param]) => {
                const value = newUrlFilter[field as keyof FILTER];
                const serializedValue = isDefined(value) ? param.serialize(value) : undefined;
                if (isTruthyString(serializedValue)) {
                    newSearchParams.set(param.key, serializedValue);
                } else {
                    newSearchParams.delete(param.key);
                }
            });
            if (newSearchParams.toString() === prevSearchParams.toString()) {
                return;
            }

            // NOTE: picking a filter restarts at page 1, even one an earlier page was picked for
            dispatch({
                type: 'set-page',
                value: 1,
                urlKey: getUrlKey(newSearchParams, urlParamEntries),
            });
            lastUrlWriteRef.current = { from: searchParams, to: newSearchParams };
            setSearchParams(newSearchParams, {
                replace: true,
                // NOTE: inputs are bound to the URL; a transition update would drop keystrokes
                flushSync: true,
            });
        },
        [urlParamEntries, searchParams, setSearchParams],
    );
    // NOTE: undefined without URL filters, so such lists keep their stable setters
    const writeUrl = hasUrlParams ? writeOwnUrl : undefined;

    const setLocalFilter = useCallback(
        (value: SetStateAction<FILTER>) => {
            dispatch({
                type: 'set-filter',
                value,
            });
        },
        [],
    );

    const setLocalAndUrlFilter = useCallback(
        (value: SetStateAction<FILTER>) => {
            const getNewFilter = (prevFilter: FILTER) => (
                typeof value === 'function' ? value(prevFilter) : value
            );
            dispatch({
                type: 'set-filter',
                value: (prevFilter) => omitUrlFields(
                    getNewFilter({ ...prevFilter, ...urlFilter }),
                    urlParamEntries,
                ),
            });
            writeOwnUrl((prevUrlFilter) => getNewFilter({ ...state.filter, ...prevUrlFilter }));
        },
        [urlFilter, urlParamEntries, writeOwnUrl, state.filter],
    );

    const setFilter = hasUrlParams ? setLocalAndUrlFilter : setLocalFilter;

    const resetFilter = useCallback(
        () => {
            dispatch({ type: 'reset-filter' });
            writeUrl?.(() => ({}));
        },
        [writeUrl],
    );

    const setFilterField = useCallback(
        (...args: EntriesAsList<FILTER>) => {
            const [val, key] = args;
            if (isDefined(writeUrl) && isDefined(urlParams?.[key])) {
                writeUrl((prevUrlFilter) => ({
                    ...prevUrlFilter,
                    [key]: val,
                }));
                return;
            }
            dispatch({
                type: 'set-filter',
                value: (oldFilterValue) => ({
                    ...oldFilterValue,
                    [key]: val,
                }),
            });
        },
        [writeUrl, urlParams],
    );

    const setPage = useCallback(
        (value: number) => {
            dispatch({
                type: 'set-page',
                value,
                urlKey,
            });
        },
        [urlKey],
    );
    const setOrdering = useCallback(
        (value: SetStateAction<SortParameter | undefined>) => {
            dispatch({
                type: 'set-ordering',
                value,
            });
        },
        [],
    );

    // NOTE: filters and page are debounced together, so no request mixes new and old
    // NOTE: memoised, useDebouncedValue restarts its timer on every new object
    const snapshot = useMemo(
        () => ({ state, urlKey }),
        [state, urlKey],
    );
    const {
        state: debouncedState,
        urlKey: debouncedUrlKey,
    } = useDebouncedValue(snapshot, debounceTime);

    const debouncedFilter = useMemo(
        () => (hasUrlParams
            ? {
                ...debouncedState.filter,
                ...parseUrlKey<FILTER>(debouncedUrlKey, urlParamEntries),
            }
            : debouncedState.filter),
        [hasUrlParams, debouncedState.filter, debouncedUrlKey, urlParamEntries],
    );

    const sortState = useMemo(
        () => ({
            sorting: state.ordering,
            setSorting: setOrdering,
        }),
        [state.ordering, setOrdering],
    );

    const filtered = useMemo(
        () => hasSomeDefinedValue(debouncedFilter),
        [debouncedFilter],
    );
    const rawFiltered = useMemo(
        () => hasSomeDefinedValue(rawFilter),
        [rawFilter],
    );

    return {
        rawFilter,
        rawFiltered,

        filter: debouncedFilter,
        filtered,
        setFilter,
        setFilterField,

        resetFilter,

        page: getPage(state, urlKey),
        offset: pageSize * (getPage(debouncedState, debouncedUrlKey) - 1),
        limit: pageSize,
        setPage,

        rawOrdering: getOrdering(state.ordering),
        ordering: getOrdering(debouncedState.ordering),

        sortState,
    };
}

export default useFilterState;
