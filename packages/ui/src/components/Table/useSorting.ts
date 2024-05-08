import {
    createContext,
    useMemo,
    useState,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import { SortDirection } from './types';

export interface SortParameter {
    name: string;
    direction: SortDirection;
}

export function getOrdering(sorting: SortParameter | undefined) {
    if (isNotDefined(sorting)) {
        return undefined;
    }

    if (sorting.direction === 'asc') {
        return sorting.name;
    }

    return `-${sorting.name}`;
}

export function useSortState(defaultValue?: SortParameter) {
    const [sorting, setSorting] = useState<SortParameter | undefined>(defaultValue);
    return { sorting, setSorting };
}

export interface SortContextInterface {
    sorting: SortParameter | undefined;
    setSorting: React.Dispatch<React.SetStateAction<SortParameter | undefined>>;
}
const initialValue: SortContextInterface = {
    sorting: undefined,
    setSorting: (state) => {
        // eslint-disable-next-line no-console
        console.warn('Trying to set to ', state);
    },
};
export const SortContext = createContext<SortContextInterface>(initialValue);

interface SortColumn<T> {
    id: string;
    valueComparator?: (foo: T, bar: T) => number;
    defaultSortDirection?: SortDirection;
}

export function useSorting<T>(
    sortParameter: SortParameter | undefined,
    columns: SortColumn<T>[],
    data: T[] | undefined,
) {
    const selectedSorter = useMemo(
        () => {
            const columnToSort = columns.find((column) => column.id === sortParameter?.name);
            return columnToSort?.valueComparator;
        },
        [columns, sortParameter?.name],
    );

    const sortedData = useMemo(
        () => {
            if (isNotDefined(data) || !selectedSorter) {
                return data;
            }
            if (sortParameter?.direction === 'dsc') {
                return [...data].sort(selectedSorter).reverse();
            }
            return [...data].sort(selectedSorter);
        },
        [data, selectedSorter, sortParameter?.direction],
    );

    return sortedData;
}

export default useSorting;
