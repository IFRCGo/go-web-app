import {
    type SetStateAction,
    useCallback,
    useMemo,
    useReducer,
} from 'react';
import { hasSomeDefinedValue } from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';
import { type EntriesAsList } from '@togglecorp/toggle-form';

import useDebouncedValue from '#hooks/useDebouncedValue';

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
    filter: FILTER,
    ordering: SortParameter | undefined,
    page: number,
}

const defaultOrdering: SortParameter = {
    name: 'id',
    direction: 'dsc',
};

function useFilterState<FILTER extends object>(options: {
    filter: FILTER,
    ordering?: SortParameter | undefined,
    page?: number,
    pageSize?: number,
    debounceTime?: number,
}) {
    const {
        filter,
        ordering = defaultOrdering,
        page = 1,
        pageSize = 10,
        debounceTime = 200,
    } = options;

    type Reducer = (
        prevState: FilterState<FILTER>,
        action: FilterActions<FILTER>,
    ) => FilterState<FILTER>;

    const [state, dispatch] = useReducer<Reducer>(
        (prevState, action) => {
            if (action.type === 'reset-filter') {
                return {
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
            filter,
            ordering,
            page,
        },
    );

    const setFilter = useCallback(
        (value: SetStateAction<FILTER>) => {
            dispatch({
                type: 'set-filter',
                value,
            });
        },
        [],
    );

    const resetFilter = useCallback(
        () => {
            dispatch({ type: 'reset-filter' });
        },
        [],
    );

    const setFilterField = useCallback(
        (...args: EntriesAsList<FILTER>) => {
            const [val, key] = args;
            setFilter((oldFilterValue) => {
                const newFilterValue = {
                    ...oldFilterValue,
                    [key]: val,
                };
                return newFilterValue;
            });
        },
        [setFilter],
    );

    const setPage = useCallback(
        (value: number) => {
            dispatch({
                type: 'set-page',
                value,
            });
        },
        [],
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

    const debouncedState = useDebouncedValue(state, debounceTime);

    const sortState = useMemo(
        () => ({
            sorting: state.ordering,
            setSorting: setOrdering,
        }),
        [state.ordering, setOrdering],
    );

    const filtered = useMemo(
        () => hasSomeDefinedValue(debouncedState.filter),
        [debouncedState.filter],
    );
    const rawFiltered = useMemo(
        () => hasSomeDefinedValue(state.filter),
        [state.filter],
    );

    return {
        rawFilter: state.filter,
        rawFiltered,

        filter: debouncedState.filter,
        filtered,
        setFilter,
        setFilterField,

        resetFilter,

        page: state.page,
        offset: pageSize * (debouncedState.page - 1),
        limit: pageSize,
        setPage,

        rawOrdering: getOrdering(ordering),
        ordering: getOrdering(debouncedState.ordering),

        sortState,
    };
}

export default useFilterState;
